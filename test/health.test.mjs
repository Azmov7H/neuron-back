import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../dist/bootstrap.js';

let app;
let server;
let baseUrl;

before(async () => {
  app = await createApp();
  await app.init();
  server = app.getHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object', 'test server did not bind a TCP port');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await app?.close();
});

test('GET /api/v1/health reports liveness', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'neuron-api');
  assert.equal(typeof body.uptimeSeconds, 'number');
  assert.equal(typeof body.timestamp, 'string');
});

test('GET /api/v1 describes the service', async () => {
  const response = await fetch(`${baseUrl}/api/v1`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { service: 'neuron-api', status: 'ok' });
});

test('an allowlisted origin receives CORS headers', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`, {
    headers: { Origin: 'http://localhost:3000' },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
});

test('an unknown origin does not receive CORS headers', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`, {
    headers: { Origin: 'https://evil.example' },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('unknown API routes return a JSON 404', async () => {
  const response = await fetch(`${baseUrl}/api/v1/does-not-exist`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.statusCode, 404);
});
