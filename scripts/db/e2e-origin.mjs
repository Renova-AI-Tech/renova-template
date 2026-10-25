import { stat } from 'node:fs/promises';
import { join } from 'node:path';

export function e2eFrontendUrl(port) {
  const value = String(port ?? '');
  if (!/^[1-9]\d{0,4}$/.test(value) || Number(value) > 65535) {
    throw new Error('Invalid test backend port');
  }
  return `http://127.0.0.1:${value}`;
}

export async function hasCompiledApp(root) {
  try {
    const frontend = await stat(join(root, 'apps/frontend/dist/index.html'));
    const backend = await stat(join(root, 'apps/backend/dist/index.js'));
    return frontend.isFile() && backend.isFile();
  } catch {
    return false;
  }
}
