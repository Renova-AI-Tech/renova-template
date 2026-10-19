import { matchGlob } from '../walk.mjs';

/**
 * Passo `done` sem o `it('nome')` no arquivo citado é recusado.
 * Checa o **nome** no arquivo; não prova que o teste distingue implementação errada
 * (isso é revisão humana + propriedades).
 *
 * @param {{ files: { rel: string, content: string }[], options: { tasksGlob?: string } }} ctx
 */
export function specTests(ctx) {
  const glob = ctx.options.tasksGlob ?? 'docs/specs/**/tasks.md';
  /** @type {{ file: string, line: number, id: string, message: string }[]} */
  const violations = [];

  for (const file of ctx.files) {
    if (!matchGlob(file.rel, glob)) continue;
    if (file.rel.includes('/_templates/')) continue;
    const blocks = splitTaskBlocks(file.content);
    for (const block of blocks) {
      const status = block.body.match(/\*\*Status:\*\*\s*`?([A-Za-z_]+)`?/i)?.[1]?.toLowerCase();
      if (status !== 'done') continue;

      const itMatch = block.body.match(/it\((['"])(.+?)\1\)/);
      const pathMatch = block.body.match(
        /`((?:apps|packages|scripts|tests|e2e|src)\/[^`]+?\.(?:ts|tsx|js|mjs))`/,
      );

      if (!itMatch || !pathMatch) {
        violations.push({
          file: file.rel,
          line: block.line,
          id: 'spec-tests',
          message: `passo done "${block.title}" precisa citar it('nome') e o arquivo de teste`,
        });
        continue;
      }

      const testName = itMatch[2];
      const testPath = pathMatch[1];
      const testFile = ctx.files.find((candidate) => candidate.rel === testPath);
      if (!testFile) {
        violations.push({
          file: file.rel,
          line: block.line,
          id: 'spec-tests',
          message: `arquivo de teste inexistente: ${testPath}`,
        });
        continue;
      }
      if (!testFile.content.includes(testName ?? '')) {
        violations.push({
          file: file.rel,
          line: block.line,
          id: 'spec-tests',
          message: `it('${testName}') não encontrado em ${testPath}`,
        });
      }
    }
  }

  return violations;
}

/**
 * @param {string} content
 */
function splitTaskBlocks(content) {
  const lines = content.split('\n');
  /** @type {{ title: string, line: number, body: string }[]} */
  const blocks = [];
  /** @type {{ title: string, line: number, parts: string[] } | null} */
  let current = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const heading = line.match(/^#{2,3}\s+(T-\d+\b.*)$/);
    if (heading) {
      if (current) {
        blocks.push({ title: current.title, line: current.line, body: current.parts.join('\n') });
      }
      current = { title: heading[1] ?? '', line: i + 1, parts: [line] };
      continue;
    }
    if (current) current.parts.push(line);
  }
  if (current) {
    blocks.push({ title: current.title, line: current.line, body: current.parts.join('\n') });
  }
  return blocks;
}
