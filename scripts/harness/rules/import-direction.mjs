import { lineNumberAt } from '../walk.mjs';

const FROM_RE = /from\s+['"]([^'"]+)['"]/g;

/**
 * packages/* não importa apps/* (ARCHITECTURE.md).
 *
 * @param {{ files: { rel: string, content: string }[] }} ctx
 */
export function importDirection(ctx) {
  /** @type {{ file: string, line: number, id: string, message: string }[]} */
  const violations = [];
  for (const file of ctx.files) {
    if (!file.rel.startsWith('packages/')) continue;
    if (!/\.(ts|tsx|js|mjs)$/.test(file.rel)) continue;
    FROM_RE.lastIndex = 0;
    let match = FROM_RE.exec(file.content);
    while (match) {
      const spec = match[1] ?? '';
      const forbidden =
        spec.startsWith('apps/') || spec.startsWith('@project/sample') || /(^|\/)apps\//.test(spec);
      if (forbidden) {
        violations.push({
          file: file.rel,
          line: lineNumberAt(file.content, match.index),
          id: 'import-direction',
          message: `packages/* não importa apps (${spec})`,
        });
      }
      match = FROM_RE.exec(file.content);
    }
  }
  return violations;
}
