#!/usr/bin/env node
/**
 * Generates a deterministic inventory of the legacy Next.js API route handlers.
 *
 * The inventory is the T00 source of truth for the frontend/backend split: it
 * lists every operation that must be ported, replayed by the parity harness, and
 * eventually switched over behind a cutover flag.
 *
 * Usage:
 *   node scripts/inventory-legacy-routes.mjs --frontend ../neuron
 *   node scripts/inventory-legacy-routes.mjs --frontend ../neuron --out docs/legacy-route-inventory.md
 *
 * Exit codes:
 *   0  inventory generated
 *   1  invalid arguments or frontend directory not found
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
]);

function parseArgs(argv) {
  const args = { frontend: resolve(REPO_ROOT, '..', 'neuron'), out: null, check: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--frontend') {
      args.frontend = resolve(argv[index + 1] ?? '');
      index += 1;
    } else if (arg === '--out') {
      args.out = resolve(argv[index + 1] ?? '');
      index += 1;
    } else if (arg === '--check') {
      args.check = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/inventory-legacy-routes.mjs [--frontend <dir>] [--out <file>] [--check]');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }

  return args;
}

function walk(directory, predicate, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      walk(resolve(directory, entry.name), predicate, files);
    } else if (predicate(entry.name)) {
      files.push(resolve(directory, entry.name));
    }
  }
  return files;
}

function readGit(frontendDir, args) {
  try {
    return execFileSync('git', ['-C', frontendDir, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function detectMethods(source) {
  const found = new Set();

  for (const method of HTTP_METHODS) {
    const exported = new RegExp(
      `export\\s+(?:const|async\\s+function|function)\\s+${method}\\b`,
    );
    const assigned = new RegExp(`export\\s*\\{[^}]*\\b${method}\\b[^}]*\\}`);
    if (exported.test(source) || assigned.test(source)) found.add(method);
  }

  return HTTP_METHODS.filter((method) => found.has(method));
}

function detectAuth(source) {
  if (/requireAuth\s*\(/.test(source)) {
    const roles = [...source.matchAll(/requireRole\s*\(\s*['"`]([^'"`]+)['"`]/g)].map(
      (match) => match[1],
    );
    return roles.length > 0 ? `role:${[...new Set(roles)].join('|')}` : 'session';
  }
  if (/getAuthContext\s*\(/.test(source) || /authenticateRequest\s*\(/.test(source)) {
    return 'session (manual)';
  }
  return 'public';
}

function detectModels(source) {
  const models = new Set();

  for (const match of source.matchAll(/from\s+['"]@\/database\/models\/([^'"]+)['"]/g)) {
    models.add(match[1].replace(/\.js$/, ''));
  }
  for (const match of source.matchAll(/import\s*\(\s*['"]@\/database\/models\/([^'"]+)['"]/g)) {
    models.add(match[1].replace(/\.js$/, ''));
  }

  return [...models].sort();
}

function detectModules(source) {
  const modules = new Set();

  for (const match of source.matchAll(/from\s+['"]@\/modules\/([^/'"]+)(?:\/[^'"]*)?['"]/g)) {
    modules.add(match[1]);
  }

  return [...modules].sort();
}

function pathToRegex(apiPath) {
  const escaped = apiPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const dynamic = escaped.replace(/\\\[[^\]]+\\\]/g, "[^'\"`\\s/)]+");
  return new RegExp(`${dynamic}(?![/A-Za-z0-9_-])`, 'g');
}

function buildConsumerIndex(frontendDir) {
  const files = walk(frontendDir, (name) => SOURCE_EXTENSIONS.has(extname(name)));

  return files
    .filter((file) => {
      const relativePath = relative(frontendDir, file).split(sep).join('/');
      return !relativePath.startsWith('app/api/');
    })
    .map((file) => ({
      relativePath: relative(frontendDir, file).split(sep).join('/'),
      source: readFileSync(file, 'utf8'),
    }))
    .filter((entry) => entry.source.includes('/api/'));
}

function findConsumers(consumerFiles, apiPath) {
  const pattern = pathToRegex(apiPath);
  return consumerFiles
    .filter((entry) => {
      pattern.lastIndex = 0;
      return pattern.test(entry.source);
    })
    .map((entry) => entry.relativePath)
    .sort();
}

function collectRoutes(frontendDir) {
  const apiRoot = resolve(frontendDir, 'app', 'api');
  if (!existsSync(apiRoot)) {
    throw new Error(`No app/api directory found under ${frontendDir}`);
  }

  const consumers = buildConsumerIndex(frontendDir);

  return walk(apiRoot, (name) => name === 'route.ts')
    .map((file) => {
      const source = readFileSync(file, 'utf8');
      const relativePath = relative(apiRoot, file).split(sep).join('/');
      const withoutFile = relativePath.replace(/\/?route\.ts$/, '');
      const apiPath = `/api${withoutFile ? `/${withoutFile}` : ''}`;
      const segments = withoutFile.split('/').filter(Boolean);

      return {
        apiPath,
        domain: segments[0] ?? 'root',
        sourcePath: `app/api/${relativePath}`,
        methods: detectMethods(source),
        auth: detectAuth(source),
        csrf: /require(?:Simulation)?CsrfProtection\s*\(/.test(source),
        rateLimit: /withRateLimit\s*\(/.test(source),
        streaming: source.includes('text/event-stream'),
        models: detectModels(source),
        modules: detectModules(source),
        consumers: findConsumers(consumers, apiPath),
        loc: source.split('\n').length,
        dynamic: /\[[^\]]+\]/.test(apiPath),
      };
    })
    .sort((left, right) => left.apiPath.localeCompare(right.apiPath));
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|');
}

function formatList(values, fallback = '—') {
  return values.length > 0 ? values.map((value) => `\`${value}\``).join(', ') : fallback;
}

function summarize(routes) {
  const operations = routes.reduce((total, route) => total + route.methods.length, 0);
  const domains = new Map();

  for (const route of routes) {
    const summary = domains.get(route.domain) ?? {
      files: 0,
      operations: 0,
      publicOperations: 0,
      streaming: 0,
      rateLimited: 0,
      csrf: 0,
    };
    summary.files += 1;
    summary.operations += route.methods.length;
    if (route.auth === 'public') summary.publicOperations += route.methods.length;
    if (route.streaming) summary.streaming += route.methods.length;
    if (route.rateLimit) summary.rateLimited += route.methods.length;
    if (route.csrf) summary.csrf += route.methods.length;
    domains.set(route.domain, summary);
  }

  return { operations, domains };
}

function renderMarkdown(routes, metadata) {
  const { operations, domains } = summarize(routes);
  const lines = [];

  lines.push('# Legacy API Route Inventory');
  lines.push('');
  lines.push(
    '> Generated file — do not edit by hand. Regenerate with `node scripts/inventory-legacy-routes.mjs --frontend <path>`.',
  );
  lines.push('');
  lines.push('## Source');
  lines.push('');
  lines.push(`- Frontend directory: \`${metadata.frontend}\``);
  lines.push(`- Frontend commit: \`${metadata.commit ?? 'unknown'}\``);
  lines.push(`- Frontend branch: \`${metadata.branch ?? 'unknown'}\``);
  lines.push(`- Generated at: \`${metadata.generatedAt}\``);
  lines.push(`- Route handler files: **${routes.length}**`);
  lines.push(`- HTTP operations: **${operations}**`);
  lines.push(
    `- Routes referenced by UI code: **${routes.filter((route) => route.consumers.length > 0).length}**`,
  );
  lines.push(`- Routes with no UI reference: **${routes.filter((route) => route.consumers.length === 0).length}**`);
  lines.push('');
  lines.push('## Summary by domain');
  lines.push('');
  lines.push('| Domain | Route files | Operations | Public ops | SSE ops | Rate limited | CSRF |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const [domain, summary] of [...domains.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(
      `| \`${domain}\` | ${summary.files} | ${summary.operations} | ${summary.publicOperations} | ${summary.streaming} | ${summary.rateLimited} | ${summary.csrf} |`,
    );
  }
  lines.push(
    `| **Total** | **${routes.length}** | **${operations}** | **${[...domains.values()].reduce((total, summary) => total + summary.publicOperations, 0)}** | **${[...domains.values()].reduce((total, summary) => total + summary.streaming, 0)}** | **${[...domains.values()].reduce((total, summary) => total + summary.rateLimited, 0)}** | **${[...domains.values()].reduce((total, summary) => total + summary.csrf, 0)}** |`,
  );
  lines.push('');
  lines.push('Column notes:');
  lines.push('');
  lines.push(
    '- **Auth** — `session` requires a valid access token; `role:<role>` requires the named RBAC role; `public` has no auth wrapper.',
  );
  lines.push(
    '- **Consumers** — number of non-API source files that reference the path. A zero count is a candidate for deprecation, not an automatic removal.',
  );
  lines.push(
    '- **Models** — Mongoose modules imported directly by the handler. A dash means the handler delegates to a service.',
  );
  lines.push(
    '- **Modules** — backend service modules imported by the handler. This is the ownership unit for the Nest port.',
  );
  lines.push('');

  for (const [domain, domainRoutes] of [...groupBy(routes, 'domain').entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`### \`${domain}\` (${domainRoutes.length} route files)`);
    lines.push('');
    lines.push(
      '| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |',
    );
    lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |');
    for (const route of domainRoutes) {
      for (const method of route.methods.length > 0 ? route.methods : ['—']) {
        lines.push(
          [
            `\`${method}\``,
            `\`${route.apiPath}\``,
            route.auth,
            route.csrf ? 'yes' : 'no',
            route.rateLimit ? 'yes' : 'no',
            route.streaming ? 'yes' : 'no',
            formatList(route.models),
            formatList(route.modules),
            route.consumers.length,
            `\`${route.sourcePath}\``,
          ]
            .map(escapeCell)
            .join(' | ')
            .replace(/^/, '| ')
            .concat(' |'),
        );
      }
    }
    lines.push('');
  }

  lines.push('## Consumer index');
  lines.push('');
  lines.push(
    'Only routes with at least one consumer are listed. Use this to order cutover work: an endpoint with no consumers can be deprecated instead of ported.',
  );
  lines.push('');
  lines.push('| Path | Consumers |');
  lines.push('| --- | --- |');
  for (const route of routes.filter((entry) => entry.consumers.length > 0)) {
    const shown = route.consumers.slice(0, 6).map((file) => `\`${file}\``);
    const suffix =
      route.consumers.length > shown.length
        ? ` +${route.consumers.length - shown.length} more`
        : '';
    lines.push(`| \`${route.apiPath}\` | ${shown.join('<br>')}${suffix} |`);
  }
  lines.push('');
  lines.push('## Unreferenced routes');
  lines.push('');
  lines.push(
    'These handlers have no source reference in the frontend. They must still be inventoried, but they are deprecation candidates and require an explicit decision in the owning task.',
  );
  lines.push('');
  const unreferenced = routes.filter((route) => route.consumers.length === 0);
  if (unreferenced.length === 0) {
    lines.push('_None._');
  } else {
    for (const route of unreferenced) {
      lines.push(
        `- \`${route.apiPath}\` (${route.methods.join(', ')}; ${route.auth}; ${route.sourcePath})`,
      );
    }
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function groupBy(routes, key) {
  const groups = new Map();
  for (const route of routes) {
    const group = groups.get(route[key]) ?? [];
    group.push(route);
    groups.set(route[key], group);
  }
  return groups;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.frontend)) {
    console.error(`Frontend directory not found: ${args.frontend}`);
    process.exit(1);
  }

  const routes = collectRoutes(args.frontend);
  const metadata = {
    frontend: relative(REPO_ROOT, args.frontend) || '.',
    commit: readGit(args.frontend, ['rev-parse', 'HEAD']),
    branch: readGit(args.frontend, ['rev-parse', '--abbrev-ref', 'HEAD']),
    generatedAt: new Date().toISOString(),
  };
  const markdown = renderMarkdown(routes, metadata);

  if (args.out) {
    if (args.check) {
      const existing = existsSync(args.out) ? readFileSync(args.out, 'utf8') : '';
      const normalize = (value) =>
        value.replace(/^- Generated at:.*$/m, '').replace(/\r\n/g, '\n');
      if (normalize(existing) !== normalize(markdown)) {
        console.error(`Inventory is out of date: ${args.out}`);
        process.exit(1);
      }
      console.log(`Inventory is up to date: ${args.out}`);
      return;
    }

    writeFileSync(args.out, markdown);
    console.log(`Wrote ${relative(REPO_ROOT, args.out)} (${routes.length} route handlers)`);
    return;
  }

  process.stdout.write(markdown);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
