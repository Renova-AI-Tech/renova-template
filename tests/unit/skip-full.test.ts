import { describe, expect, it } from 'vitest';
import { decideSkipFull, isDocsOnlyPath, shouldSkipFull } from '../../scripts/ci/skip-full.mjs';

describe('skip do job full em PR so de docs', () => {
  it('reconhece markdown, docs, skills e LICENSE', () => {
    expect(isDocsOnlyPath('README.md')).toBe(true);
    expect(isDocsOnlyPath('AGENTS.md')).toBe(true);
    expect(isDocsOnlyPath('docs/process/operations.md')).toBe(true);
    expect(isDocsOnlyPath('docs/specs/foo.png')).toBe(true);
    expect(isDocsOnlyPath('.agents/skills/verify-app/SKILL.md')).toBe(true);
    expect(isDocsOnlyPath('LICENSE')).toBe(true);
  });

  it('recusa codigo, workflow, testes e traversal', () => {
    expect(isDocsOnlyPath('.github/workflows/ci.yml')).toBe(false);
    expect(isDocsOnlyPath('playwright.config.ts')).toBe(false);
    expect(isDocsOnlyPath('apps/frontend/src/pages/HomePage.tsx')).toBe(false);
    expect(isDocsOnlyPath('scripts/ci/skip-full.mjs')).toBe(false);
    expect(isDocsOnlyPath('tests/e2e/auth.spec.ts')).toBe(false);
    expect(isDocsOnlyPath('../README.md')).toBe(false);
    expect(isDocsOnlyPath('/README.md')).toBe(false);
    expect(isDocsOnlyPath('')).toBe(false);
  });

  it('so pula quando todos os arquivos sao docs e a lista nao veio truncada', () => {
    expect(shouldSkipFull(['docs/process/operations.md', 'README.md'])).toBe(true);
    expect(shouldSkipFull(['README.md', 'apps/backend/src/server/app.ts'])).toBe(false);
    expect(shouldSkipFull([])).toBe(false);
    expect(shouldSkipFull(['README.md'], true)).toBe(false);
  });

  it('nao consulta a API fora de pull_request ou sem numero', async () => {
    expect(await decideSkipFull({ GITHUB_EVENT_NAME: 'push' })).toBe(false);
    expect(await decideSkipFull({ GITHUB_EVENT_NAME: 'pull_request' })).toBe(false);
    expect(
      await decideSkipFull({
        GITHUB_EVENT_NAME: 'pull_request',
        GITHUB_REPOSITORY: 'Renova-AI-Tech/renova-template',
        PR_NUMBER: '0',
        GITHUB_TOKEN: 'x',
      }),
    ).toBe(false);
  });
});
