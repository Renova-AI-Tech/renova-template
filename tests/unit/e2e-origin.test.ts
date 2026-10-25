import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { e2eFrontendUrl, hasCompiledApp } from '../../scripts/db/e2e-origin.mjs';
import { shouldRegisterFrontend } from '../../apps/backend/src/server/frontend.js';

describe('origem unica do E2E no build compilado', () => {
  const dirs: string[] = [];
  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('aponta o frontend do E2E para a porta do backend', () => {
    expect(e2eFrontendUrl('43124')).toBe('http://127.0.0.1:43124');
    expect(() => e2eFrontendUrl('0')).toThrow(/Invalid test backend port/);
    expect(() => e2eFrontendUrl('70000')).toThrow(/Invalid test backend port/);
  });

  it('exige dist do frontend e do backend', async () => {
    const root = await mkdtemp(join(tmpdir(), 'renova-e2e-build-'));
    dirs.push(root);
    expect(await hasCompiledApp(root)).toBe(false);
    await mkdir(join(root, 'apps/frontend/dist'), { recursive: true });
    await mkdir(join(root, 'apps/backend/dist'), { recursive: true });
    await writeFile(join(root, 'apps/frontend/dist/index.html'), '<html></html>');
    expect(await hasCompiledApp(root)).toBe(false);
    await writeFile(join(root, 'apps/backend/dist/index.js'), 'export {};');
    expect(await hasCompiledApp(root)).toBe(true);
  });

  it('serve o build em producao ou na origem unica de teste, nao no Vite em duas portas', () => {
    expect(
      shouldRegisterFrontend({
        NODE_ENV: 'production',
        HOST: '::',
        PORT: 3000,
        FRONTEND_URL: 'https://project.example.com',
      }),
    ).toBe(true);
    expect(
      shouldRegisterFrontend({
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 43124,
        FRONTEND_URL: 'http://127.0.0.1:43124',
      }),
    ).toBe(true);
    expect(
      shouldRegisterFrontend({
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 43124,
        FRONTEND_URL: 'http://127.0.0.1:43123',
      }),
    ).toBe(false);
  });
});
