# Template de projeto (harness agent-first)

Repositório-semente para novos projetos da **Renova AI Tech** (Gustavo Priebe). O agente lê [AGENTS.md](AGENTS.md); humanos leem este README.

Stack: TypeScript, pnpm, Vitest, fast-check, Playwright, Biome. Docs em **português (pt-BR)**.

## Hierarquia

```
AGENTS.md                 mapa curto (~100 linhas) — sempre injetado
CLAUDE.md                 @AGENTS.md
ARCHITECTURE.md           camadas e direção das dependências
docs/index.md             qual doc responde o quê
docs/specs/<slug>/        requirements, design, tasks
docs/plans/               active, completed, feature-list.json, progress.md
.agents/skills/           3 skills (padrão Agent Skills)
.claude/skills            symlink → .agents/skills
.mcp.json                 Linear + Playwright; segredos ${VAR}
scripts/init.sh
scripts/check-quick       lint + types + harness + unit/property
scripts/check-full        + integração + e2e
tests/{unit,property,integration,e2e}/
packages/money            conta pura (sample)
apps/sample               UI na porta 43123
```

`AGENTS.md` aninhado **só** onde a regra muda (`packages/money`, `apps/sample`, `scripts/harness`).

## Como começar um projeto a partir disto

1. Use este repo como template (GitHub “Use this template” / clone).
2. `bash scripts/init.sh`
3. Substitua os placeholders (busca no repo inteiro):

| Placeholder | Significado |
| --- | --- |
| `{{PROJECT}}` | nome do produto |
| `{{LINEAR_TEAM}}` | time Linear |
| `{{LINEAR_TEAM_KEY}}` | prefixo do item (`REN-42`) |
| `{{ISSUE_PREFIX}}` | prefixo da branch (`ren-42-slug`) |
| `{{GITHUB_OWNER}}` | dono no CODEOWNERS |

4. Renomeie o scope npm `@project` se quiser.
5. Quando o app real existir, apague `apps/sample` e estenda `docs/specs/feature-map.md`.
6. `LINEAR_API_KEY` no ambiente — nunca no Git. MCP: `.mcp.json`.

## Comandos

```bash
pnpm install          # ou bash scripts/init.sh
pnpm dev              # http://127.0.0.1:43123
pnpm test:loop        # unit + property
pnpm harness:check
pnpm harness:test
pnpm check:quick      # o mesmo script do CI / pre-push (alias: ci:quick)
pnpm check:full       # + e2e (precisa Chromium)
```

## O que customizar vs. o que não mexer sem dono

**Customizar:** placeholders, `ARCHITECTURE.md`, specs, feature map, regras em `harness.rules.mjs`, time Linear.

**CODEOWNERS protege:** `AGENTS.md`, `scripts/`, `docs/process/`, `harness.rules.mjs`, skills, CI. Não desligue regra para o PR passar — corrija a regra **e** o teste do harness.

## Skills

Cursor lê `.agents/skills/`. Claude Code lê `.claude/skills` (symlink). Não copie o corpo para `.cursor/skills`.

- `feature-from-issue`
- `verify-app`
- `failure-to-rule`
