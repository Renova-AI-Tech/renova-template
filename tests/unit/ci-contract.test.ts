import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf8'));

describe('contrato CI Blacksmith (REQ-031, REQ-039)', () => {
  it('recusa CI incompleto mesmo com workflow secundario verde', () => {
    const command = workflow.jobs.required.steps[0].run;
    for (const result of ['failure', 'cancelled', 'skipped', 'pending', '']) {
      for (const env of [
        {
          QUALITY_RESULT: result,
          FULL_RESULT: 'success',
          PROFILES_RESULT: 'success',
          SOURCE_REPOSITORY: 'Renova-AI-Tech/renova-template',
        },
        {
          QUALITY_RESULT: 'success',
          FULL_RESULT: result,
          PROFILES_RESULT: 'success',
          SOURCE_REPOSITORY: 'Renova-AI-Tech/renova-template',
        },
        {
          QUALITY_RESULT: 'success',
          FULL_RESULT: 'success',
          PROFILES_RESULT: result,
          SOURCE_REPOSITORY: 'Renova-AI-Tech/renova-template',
        },
      ]) {
        expect(spawnSync('bash', ['-c', command], { env }).status).toBe(1);
      }
    }
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          QUALITY_RESULT: 'success',
          FULL_RESULT: 'success',
          PROFILES_RESULT: 'success',
          SOURCE_REPOSITORY: 'Renova-AI-Tech/renova-template',
        },
      }).status,
    ).toBe(0);
  });

  it('exige matriz no template e valida apenas o perfil escolhido em clones', () => {
    expect(workflow.jobs.profiles.if).toBe(
      "github.repository == 'Renova-AI-Tech/renova-template' && github.event_name == 'pull_request' && needs.quality.outputs.skip_full != 'true'",
    );
    const command = workflow.jobs.required.steps[0].run;
    for (const profile of ['failure', 'cancelled', 'pending', 'success', '']) {
      expect(
        spawnSync('bash', ['-c', command], {
          env: {
            QUALITY_RESULT: 'success',
            FULL_RESULT: 'success',
            PROFILES_RESULT: profile,
            SOURCE_REPOSITORY: 'Renova-AI-Tech/meu-produto',
          },
        }).status,
      ).toBe(1);
    }
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          QUALITY_RESULT: 'success',
          FULL_RESULT: 'success',
          PROFILES_RESULT: 'skipped',
          SOURCE_REPOSITORY: 'Renova-AI-Tech/meu-produto',
        },
      }).status,
    ).toBe(0);
    expect(workflow.jobs.profiles.steps.map((step: { run?: string }) => step.run)).toContain(
      'pnpm test:profiles',
    );
  });

  it('executa todos os jobs em Blacksmith sem fallback', () => {
    expect(Object.keys(workflow.jobs)).toEqual(['quality', 'full', 'profiles', 'required']);
    for (const job of Object.values(workflow.jobs) as Record<string, unknown>[]) {
      expect(job['runs-on']).toMatch(/^blacksmith-[24]vcpu-ubuntu-2404$/);
      expect(job['continue-on-error']).toBeUndefined();
    }
    expect(workflow.jobs.full['runs-on']).toBe('blacksmith-2vcpu-ubuntu-2404');
    expect(workflow.jobs.profiles['runs-on']).toBe('blacksmith-2vcpu-ubuntu-2404');
    expect(workflow.jobs.quality['runs-on']).toBe('blacksmith-2vcpu-ubuntu-2404');
    expect(workflow.jobs.required['runs-on']).toBe('blacksmith-2vcpu-ubuntu-2404');
  });

  it('cobre PR push e exige agregador mesmo em falha ou skip', () => {
    expect(workflow.on.pull_request.types).toContain('synchronize');
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.on.pull_request['paths-ignore']).toBeUndefined();
    expect(workflow.on.push['paths-ignore']).toBeUndefined();
    expect(workflow.jobs.required.if).toBe('always()');
    expect(workflow.jobs.required.needs).toEqual(['quality', 'full', 'profiles']);
    expect(workflow.jobs.quality.if).toBeUndefined();
    expect(workflow.jobs.full.if).toBe(
      "github.event_name == 'pull_request' && needs.quality.outputs.skip_full != 'true'",
    );
    expect(workflow.jobs.quality.outputs.skip_full).toBe(`\${{ steps.paths.outputs.skip_full }}`);
    expect(workflow.jobs.quality.steps.map((step: { run?: string }) => step.run)).toContain(
      'node scripts/ci/skip-full.mjs',
    );
  });

  it('aceita full skipped so na main ou em PR so de docs', () => {
    const command = workflow.jobs.required.steps[0].run;
    const clone = {
      QUALITY_RESULT: 'success',
      PROFILES_RESULT: 'skipped',
      SOURCE_REPOSITORY: 'Renova-AI-Tech/meu-produto',
    };
    expect(
      spawnSync('bash', ['-c', command], {
        env: { ...clone, FULL_RESULT: 'skipped', EVENT_NAME: 'push', SKIP_FULL: 'false' },
      }).status,
    ).toBe(0);
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          ...clone,
          FULL_RESULT: 'skipped',
          EVENT_NAME: 'pull_request',
          SKIP_FULL: 'true',
        },
      }).status,
    ).toBe(0);
    expect(
      spawnSync('bash', ['-c', command], {
        env: { ...clone, FULL_RESULT: 'success', EVENT_NAME: 'push', SKIP_FULL: 'false' },
      }).status,
    ).toBe(0);
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          ...clone,
          FULL_RESULT: 'skipped',
          EVENT_NAME: 'pull_request',
          SKIP_FULL: 'false',
        },
      }).status,
    ).toBe(1);
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          QUALITY_RESULT: 'failure',
          FULL_RESULT: 'skipped',
          PROFILES_RESULT: 'skipped',
          SOURCE_REPOSITORY: 'Renova-AI-Tech/meu-produto',
          EVENT_NAME: 'pull_request',
          SKIP_FULL: 'true',
        },
      }).status,
    ).toBe(1);
  });

  it('aceita profiles skipped so na main ou em PR so de docs do template', () => {
    const command = workflow.jobs.required.steps[0].run;
    const template = {
      QUALITY_RESULT: 'success',
      SOURCE_REPOSITORY: 'Renova-AI-Tech/renova-template',
    };
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          ...template,
          FULL_RESULT: 'skipped',
          PROFILES_RESULT: 'skipped',
          EVENT_NAME: 'push',
          SKIP_FULL: 'false',
        },
      }).status,
    ).toBe(0);
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          ...template,
          FULL_RESULT: 'skipped',
          PROFILES_RESULT: 'skipped',
          EVENT_NAME: 'pull_request',
          SKIP_FULL: 'true',
        },
      }).status,
    ).toBe(0);
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          ...template,
          FULL_RESULT: 'success',
          PROFILES_RESULT: 'skipped',
          EVENT_NAME: 'pull_request',
          SKIP_FULL: 'false',
        },
      }).status,
    ).toBe(1);
    expect(
      spawnSync('bash', ['-c', command], {
        env: {
          ...template,
          FULL_RESULT: 'success',
          PROFILES_RESULT: 'success',
          EVENT_NAME: 'pull_request',
          SKIP_FULL: 'false',
        },
      }).status,
    ).toBe(0);
  });

  it('executa banco e navegador como gates bloqueantes', () => {
    const commands = workflow.jobs.full.steps
      .map((step: { run?: string }) => step.run)
      .filter(Boolean);
    expect(commands).toContain('pnpm test:integration');
    expect(commands).toContain('pnpm test:e2e');
    expect(commands).toContain('pnpm exec playwright install --with-deps chromium');
    expect(commands).toContain('pnpm install --frozen-lockfile');
    expect(commands).toContain('pnpm build');
    expect(readFileSync('playwright.config.ts', 'utf8')).toContain(
      "command: 'node apps/backend/dist/index.js'",
    );
    expect(readFileSync('playwright.config.ts', 'utf8')).not.toContain("command: 'pnpm dev'");
    expect(readFileSync('scripts/check-quick', 'utf8')).toContain('GIT_CONFIG_GLOBAL=/dev/null');
  });

  it('fixa actions e limita permissoes sem credenciais de publicacao', () => {
    expect(workflow.permissions).toEqual({ contents: 'read', 'pull-requests': 'read' });
    for (const job of Object.values(workflow.jobs) as {
      steps: { uses?: string; with?: Record<string, unknown> }[];
    }[]) {
      for (const step of job.steps) {
        if (step.uses) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
        if (step.uses?.startsWith('actions/checkout@')) {
          expect(step.with?.['persist-credentials']).toBe(false);
          expect(step.with?.ref).toBe(`\${{ github.event.pull_request.head.sha || github.sha }}`);
        }
      }
    }
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).not.toContain('secrets.');
  });
});
