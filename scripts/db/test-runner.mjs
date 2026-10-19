import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createTestDatabase, stopTestDatabase } from './local.mjs';
import { buildMigrator, migrateLocalDatabase } from './migrate.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const [mode = 'integration', ...filters] = process.argv.slice(2);
if (!['integration', 'e2e'].includes(mode) || filters.some((value) => value.startsWith('-'))) {
  throw new Error('Use integration ou e2e e, opcionalmente, caminhos de testes.');
}
let handle;
let child;
let requestedSignal;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    requestedSignal = signal;
    child?.kill(signal);
  });
}
try {
  await buildMigrator(root);
  handle = await createTestDatabase(root);
  if (requestedSignal) throw new Error('Validation interrupted');
  await migrateLocalDatabase(handle);
  const args =
    mode === 'integration'
      ? ['exec', 'vitest', 'run', '--config', 'vitest.integration.config.ts', ...filters]
      : ['exec', 'playwright', 'test', ...filters];
  process.exitCode = await new Promise((accept, reject) => {
    child = spawn('pnpm', args, {
      cwd: root,
      env: { ...process.env, ...handle.env },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => accept(code ?? 1));
  });
} catch {
  process.stderr.write(
    'Validação interrompida: não foi possível preparar ou executar o banco descartável.\n',
  );
  process.exitCode = 1;
} finally {
  if (handle) await stopTestDatabase(root, handle);
}
