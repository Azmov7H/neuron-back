/**
 * Boundary guard: this package (simulation core) must stay framework-free so it can run in the
 * browser, in the Next.js cutover client, and in the NestJS API.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = [
  /from ['"]mongoose['"]/,
  /from ['"]next(\/|['"])/,
  /from ['"]@\//,
  /process\.env/,
];

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sources(path));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(path);
  }
  return out;
}

describe('package boundary', () => {
  it('contains no Mongoose, Next.js, path-alias, or env imports', () => {
    const root = join(import.meta.dirname, '..', 'src');
    for (const file of sources(root)) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(content), `${file} matches ${pattern}`).toBe(false);
      }
    }
  });
});
