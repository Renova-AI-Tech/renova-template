# AGENTS.md

Mapa do repo para o agente. Manual: [docs/index.md](docs/index.md). Docs em **pt-BR**; código em inglês. Clone limpo: não carregue skill pessoal.

O arquivo **mais próximo** do path editado vence ([agents.md](https://agents.md/) · Codex concatena raiz → cwd). Aninhado só onde a regra muda: [packages/money/AGENTS.md](packages/money/AGENTS.md), [apps/sample/AGENTS.md](apps/sample/AGENTS.md), [scripts/harness/AGENTS.md](scripts/harness/AGENTS.md).

## Onde está

| Precisa de | Abra |
| --- | --- |
| Camadas e dependências | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Qual doc responde o quê | [docs/index.md](docs/index.md) |
| O que existe agora | [docs/plans/active/current.md](docs/plans/active/current.md) |
| Trabalho longo (passes) | [docs/plans/feature-list.json](docs/plans/feature-list.json) + [progress.md](docs/plans/progress.md) |
| Spec da feature | [docs/specs/](docs/specs/) (`requirements` / `design` / `tasks`) |
| Jornadas de UI | [docs/specs/feature-map.md](docs/specs/feature-map.md) |
| Linear | [docs/process/linear-conventions.md](docs/process/linear-conventions.md) |
| Skills | [.agents/skills/](.agents/skills/) |

## Comandos (os mesmos no CI)

```
bash scripts/init.sh     # VM / clone
pnpm test:loop           # unit + property, sem DB
pnpm check:quick         # harness + lint + types + loop
pnpm check:full          # + integração + e2e
pnpm dev                 # http://127.0.0.1:43123
```

Aliases: `ci:quick` → `check:quick`. Sem npm/yarn. Sem `--no-verify`.

## Inegotiável

- Um item Linear (`{{LINEAR_TEAM}}`) → branch `{{ISSUE_PREFIX}}-NN-slug` → um PR.
- Não enfraqueça teste, timeout, asserção ou regra do harness para o CI passar.
- Não decida produto sozinho (preço, permissão, apagar dado). Anote no item e pare.
- Tela: skill `verify-app`. Unitário com fake-api não fecha jornada.
- Pronto = comando verde + o que **não** foi verificado escrito. O texto do agente não é o veredito.
- Segredo fora do Git. MCP em [`.mcp.json`](.mcp.json) com `${VAR}`.

## Skills (corpo só sob demanda)

- [`feature-from-issue`](.agents/skills/feature-from-issue/SKILL.md) — item → spec → PR
- [`verify-app`](.agents/skills/verify-app/SKILL.md) — sobe o app e anda o feature map
- [`failure-to-rule`](.agents/skills/failure-to-rule/SKILL.md) — erro repetido → teste, lint ou regra

Não instale coleção extra. Descrição de skill entra em toda sessão.

## A máquina recusa

`pnpm harness:check` — motor em `scripts/harness/`, produto em [harness.rules.mjs](harness.rules.mjs). Formato `arquivo:linha [id] mensagem`.

Formatação: husky + hook Claude `PostToolUse`. Gate: pre-push `check:quick`. Prosa neste arquivo **não** substitui hook/lint/CI.

## Sessão longa

1. `pwd`, `git log`, [progress.md](docs/plans/progress.md), [feature-list.json](docs/plans/feature-list.json).
2. Uma feature. Só mude `passes` no JSON — não apague item.
3. Commit limpo + nota em progress.md.

Revisor em **contexto fresco**, não o autor. PR: [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
