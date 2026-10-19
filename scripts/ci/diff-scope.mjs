#!/usr/bin/env node
/**
 * Define se o diff é só documentação. Usado pelo CI para pular typecheck/testes.
 * Docs-only ainda roda harness:check (links e índice).
 */
import { execSync } from 'node:child_process';

const eventName = process.env.GITHUB_EVENT_NAME ?? '';
const baseRef =
  process.env.GITHUB_BASE_REF ||
  (eventName === 'push' ? `${process.env.GITHUB_REF_NAME}^` : 'origin/main');

let diff = '';
try {
  if (process.env.GITHUB_BASE_REF) {
    execSync(`git fetch origin ${process.env.GITHUB_BASE_REF} --depth=50`, { stdio: 'ignore' });
    diff = execSync(`git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`, {
      encoding: 'utf8',
    });
  } else {
    diff = execSync('git diff --name-only HEAD~1...HEAD', { encoding: 'utf8' });
  }
} catch {
  diff = execSync('git diff --name-only', { encoding: 'utf8' });
}

const files = diff
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const docsOnlyPattern =
  /^(docs\/|\.agents\/skills\/|ARCHITECTURE\.md$|AGENTS\.md$|CLAUDE\.md$|.*\.md$)$/;
const docsOnly = files.length > 0 && files.every((file) => docsOnlyPattern.test(file));

if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_OUTPUT, `docs_only=${docsOnly}\n`);
}

console.log(`diff-scope files=${files.length} docs_only=${docsOnly} base=${baseRef}`);
for (const file of files) {
  console.log(` - ${file}`);
}
