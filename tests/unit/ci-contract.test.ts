import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf8'));
const playwright = readFileSync('playwright.config.ts', 'utf8');
const vite = readFileSync('apps/frontend/vite.config.ts', 'utf8');
const runner = readFileSync('scripts/db/test-runner.mjs', 'utf8');
const deploy = readFileSync('scripts/deploy/release.mjs', 'utf8');

type WorkflowStep = {
  run?: string;
  uses?: string;
  if?: string;
  name?: string;
  'continue-on-error'?: boolean;
  with?: Record<string, unknown>;
};

type WorkflowJob = {
  'runs-on'?: string;
  if?: string;
  needs?: string[];
  name?: string;
  'continue-on-error'?: boolean;
  'timeout-minutes'?: number;
  steps: WorkflowStep[];
};

const job = workflow.jobs.required as WorkflowJob;
const commands = job.steps.map((step) => step.run).filter((run): run is string => Boolean(run));
const prCode =
  "github.event_name == 'workflow_dispatch' || (github.event_name == 'pull_request' && steps.paths.outputs.skip_full != 'true')";

describe('contrato CI Blacksmith (REQ-031, REQ-039)', () => {
  it('recusa CI incompleto mesmo com workflow secundario verde', () => {
    expect(Object.keys(workflow.jobs)).toEqual(['required']);
    expect(job.if).toBeUndefined();
    expect(job.needs).toBeUndefined();
    expect(job.name).toBeUndefined();
    expect(job['continue-on-error']).toBeUndefined();
    expect(deploy).toContain("job.name === 'required'");
  });

  it('executa o unico job em Blacksmith 2 vCPU sem fallback', () => {
    expect(job['runs-on']).toBe('blacksmith-2vcpu-ubuntu-2404');
    expect(job['timeout-minutes']).toBe(25);
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).not.toMatch(/ubuntu-latest|4vcpu/);
    for (const step of job.steps) {
      expect(step['continue-on-error']).toBeUndefined();
    }
  });

  it('cobre PR, push da main e dispatch sem pular o check por path', () => {
    expect(workflow.on.pull_request.types).toContain('synchronize');
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.on.workflow_dispatch).toBeDefined();
    expect(workflow.on.pull_request['paths-ignore']).toBeUndefined();
    expect(workflow.on.push['paths-ignore']).toBeUndefined();
    expect(workflow.permissions).toEqual({ contents: 'read', 'pull-requests': 'read' });
    expect(commands).toContain('node scripts/ci/skip-full.mjs');
  });

  it('instala e confere sempre; build, banco e navegador so em PR de codigo ou dispatch', () => {
    expect(commands).toEqual([
      'node scripts/ci/skip-full.mjs',
      'pnpm install --frozen-lockfile',
      'pnpm check:quick',
      'pnpm build',
      'pnpm test:integration',
      'pnpm test:containers',
      'pnpm exec playwright install --with-deps chromium',
      'pnpm test:e2e',
      'pnpm test:profiles',
    ]);
    const prOnly = ['pnpm build', 'pnpm test:integration', 'pnpm test:containers', 'pnpm test:e2e'];
    for (const run of prOnly) {
      expect(job.steps.find((step) => step.run === run)?.if).toBe(prCode);
    }
    expect(job.steps.find((step) => step.run === 'pnpm check:quick')?.if).toBeUndefined();
    expect(
      job.steps.find((step) => step.run === 'pnpm install --frozen-lockfile')?.if,
    ).toBeUndefined();
    expect(
      job.steps.find((step) => step.run === 'pnpm exec playwright install --with-deps chromium')
        ?.if,
    ).toBe(
      `${prCode} || (github.repository == 'Renova-AI-Tech/renova-template' && steps.paths.outputs.run_profiles == 'true')`,
    );
  });

  it('matriz de perfis so no template, em path de geracao ou dispatch', () => {
    const profiles = job.steps.find((step) => step.name === 'Matriz de perfis');
    expect(profiles?.run).toBe('pnpm test:profiles');
    expect(profiles?.if).toBe(
      "github.repository == 'Renova-AI-Tech/renova-template' && (github.event_name == 'workflow_dispatch' || steps.paths.outputs.run_profiles == 'true')",
    );
  });

  it('serve o E2E pelo dist com preview e API em portas distintas', () => {
    expect(playwright).toContain("command: 'node apps/backend/dist/index.js'");
    expect(playwright).toContain('vite preview');
    expect(playwright).not.toContain("command: 'pnpm dev'");
    expect(vite).toMatch(/preview:\s*serve/);
    expect(vite).toContain("'/api'");
    expect(runner).not.toContain('FRONTEND_URL = e2eFrontendUrl');
    expect(readFileSync('scripts/check-quick', 'utf8')).toContain('GIT_CONFIG_GLOBAL=/dev/null');
  });

  it('fixa actions e limita permissoes sem credenciais de publicacao', () => {
    for (const step of job.steps) {
      if (step.uses) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
      if (step.uses?.startsWith('actions/checkout@')) {
        expect(step.with?.['persist-credentials']).toBe(false);
        expect(step.with?.ref).toBe(`\${{ github.event.pull_request.head.sha || github.sha }}`);
      }
    }
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).not.toContain('secrets.');
  });
});
