import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf8'));

function stepRuns(job: { steps: { run?: string }[] }) {
  return job.steps.map((step) => step.run).filter(Boolean);
}

describe('contrato CI Blacksmith (REQ-031, REQ-039)', () => {
  it('tem um unico job que sempre roda em Blacksmith sem fallback', () => {
    expect(Object.keys(workflow.jobs)).toEqual(['ci']);
    expect(workflow.jobs.ci.if).toBeUndefined();
    expect(workflow.jobs.ci['runs-on']).toBe('blacksmith-2vcpu-ubuntu-2404');
    expect(workflow.jobs.ci['continue-on-error']).toBeUndefined();
    expect(workflow.jobs.ci['timeout-minutes']).toBe(25);
    for (const step of workflow.jobs.ci.steps as { 'continue-on-error'?: boolean }[]) {
      expect(step['continue-on-error']).toBeUndefined();
    }
  });

  it('cobre PR, push na main e dispatch manual sem paths-ignore', () => {
    expect(workflow.on.pull_request.types).toContain('synchronize');
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.on.workflow_dispatch).toBeDefined();
    expect(workflow.on.pull_request['paths-ignore']).toBeUndefined();
    expect(workflow.on.push['paths-ignore']).toBeUndefined();
    expect(workflow.jobs.ci.steps.map((step: { run?: string }) => step.run)).toContain(
      'node scripts/ci/skip-full.mjs',
    );
  });

  it('instala, confere e constroi uma vez; DB e navegador so em PR de codigo ou dispatch', () => {
    const commands = stepRuns(workflow.jobs.ci);
    expect(commands).toContain('pnpm install --frozen-lockfile');
    expect(commands).toContain('pnpm check:quick');
    expect(commands).toContain('pnpm build');
    expect(commands.filter((command) => command === 'pnpm build')).toHaveLength(1);
    expect(commands.filter((command) => command === 'pnpm install --frozen-lockfile')).toHaveLength(
      1,
    );
    const tests = workflow.jobs.ci.steps.find(
      (step: { name?: string }) => step.name === 'Containers, integração e navegador',
    );
    expect(tests.if).toBe(
      "github.event_name == 'workflow_dispatch' || (github.event_name == 'pull_request' && steps.paths.outputs.skip_full != 'true')",
    );
    expect(tests.run).toContain('pnpm test:containers');
    expect(tests.run).toContain('pnpm test:integration');
    expect(tests.run).toContain('pnpm test:e2e');
    expect(commands).toContain('pnpm exec playwright install --with-deps chromium');
    expect(readFileSync('playwright.config.ts', 'utf8')).toContain(
      "command: 'node apps/backend/dist/index.js'",
    );
    expect(readFileSync('playwright.config.ts', 'utf8')).not.toContain("command: 'pnpm dev'");
    expect(readFileSync('scripts/check-quick', 'utf8')).toContain('GIT_CONFIG_GLOBAL=/dev/null');
  });

  it('matriz de perfis so no template, em path de geracao ou dispatch', () => {
    const profiles = workflow.jobs.ci.steps.find(
      (step: { name?: string }) => step.name === 'Matriz de perfis',
    );
    expect(profiles.run).toBe('pnpm test:profiles');
    expect(profiles.if).toBe(
      "github.repository == 'Renova-AI-Tech/renova-template' && (github.event_name == 'workflow_dispatch' || steps.paths.outputs.run_profiles == 'true')",
    );
  });

  it('fixa actions e limita permissoes sem credenciais de publicacao', () => {
    expect(workflow.permissions).toEqual({ contents: 'read', 'pull-requests': 'read' });
    for (const step of workflow.jobs.ci.steps as {
      uses?: string;
      with?: Record<string, unknown>;
    }[]) {
      if (step.uses) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
      if (step.uses?.startsWith('actions/checkout@')) {
        expect(step.with?.['persist-credentials']).toBe(false);
        expect(step.with?.ref).toBe(`\${{ github.event.pull_request.head.sha || github.sha }}`);
      }
    }
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).not.toContain('secrets.');
  });
});
