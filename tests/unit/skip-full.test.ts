import { describe, expect, it } from 'vitest';
import {
  classifyCi,
  decideSkipFull,
  isDocsOnlyPath,
  isGeneratorPath,
  shouldRunProfiles,
  shouldSkipFull,
} from '../../scripts/ci/skip-full.mjs';

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

describe('matriz de perfis so com paths de geracao', () => {
  it('reconhece receita, lockfile, CI e runner de teste', () => {
    expect(isGeneratorPath('templates/modules/auth/files/apps/backend/src/server/app.ts')).toBe(
      true,
    );
    expect(isGeneratorPath('scripts/project/generate.mjs')).toBe(true);
    expect(isGeneratorPath('scripts/db/test-runner.mjs')).toBe(true);
    expect(isGeneratorPath('scripts/ci/skip-full.mjs')).toBe(true);
    expect(isGeneratorPath('.github/workflows/ci.yml')).toBe(true);
    expect(isGeneratorPath('package.json')).toBe(true);
    expect(isGeneratorPath('pnpm-lock.yaml')).toBe(true);
    expect(isGeneratorPath('playwright.config.ts')).toBe(true);
    expect(isGeneratorPath('scripts/check-quick')).toBe(true);
    expect(isGeneratorPath('renova.project.json')).toBe(true);
  });

  it('recusa produto, docs e traversal', () => {
    expect(isGeneratorPath('apps/frontend/src/pages/HomePage.tsx')).toBe(false);
    expect(isGeneratorPath('packages/ui/src/components/ui/button.tsx')).toBe(false);
    expect(isGeneratorPath('README.md')).toBe(false);
    expect(isGeneratorPath('docs/process/operations.md')).toBe(false);
    expect(isGeneratorPath('../templates/x.ts')).toBe(false);
    expect(isGeneratorPath('')).toBe(false);
  });

  it('so agenda a matriz quando algum path e de geracao e a PR nao e so docs', () => {
    expect(shouldRunProfiles(['scripts/project/generate.mjs'])).toBe(true);
    expect(shouldRunProfiles(['templates/modules/auth/README.md', 'package.json'])).toBe(true);
    expect(shouldRunProfiles(['apps/frontend/src/pages/HomePage.tsx'])).toBe(false);
    expect(shouldRunProfiles(['README.md', 'docs/process/operations.md'])).toBe(false);
    expect(shouldRunProfiles([])).toBe(false);
    expect(shouldRunProfiles(['README.md'], true)).toBe(true);
  });

  it('agenda a matriz no dispatch do template e nunca no push', async () => {
    expect(
      await classifyCi({
        GITHUB_EVENT_NAME: 'workflow_dispatch',
        GITHUB_REPOSITORY: 'Renova-AI-Tech/renova-template',
      }),
    ).toEqual({ skipFull: false, runProfiles: true });
    expect(
      await classifyCi({
        GITHUB_EVENT_NAME: 'workflow_dispatch',
        GITHUB_REPOSITORY: 'Renova-AI-Tech/meu-produto',
      }),
    ).toEqual({ skipFull: false, runProfiles: false });
    expect(
      await classifyCi({
        GITHUB_EVENT_NAME: 'push',
        GITHUB_REPOSITORY: 'Renova-AI-Tech/renova-template',
      }),
    ).toEqual({ skipFull: false, runProfiles: false });
  });
});
