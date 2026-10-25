import { stat } from 'node:fs/promises';
import { join } from 'node:path';

export async function hasCompiledApp(root) {
  try {
    const frontend = await stat(join(root, 'apps/frontend/dist/index.html'));
    const backend = await stat(join(root, 'apps/backend/dist/index.js'));
    return frontend.isFile() && backend.isFile();
  } catch {
    return false;
  }
}
