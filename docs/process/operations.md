# Operações

## Comandos

Os scripts são a fonte. O CI chama os mesmos arquivos.

| Comando | Faz |
| --- | --- |
| `bash scripts/init.sh` | pnpm install + `.env` de exemplo |
| `pnpm dev` | sample em http://127.0.0.1:43123 |
| `pnpm test:loop` | `tests/unit` + `tests/property` |
| `pnpm check:quick` | harness + Biome + types + loop |
| `pnpm check:full` | + integração + E2E |
| `SKIP_E2E=1 pnpm check:full` | alias `pnpm ci:local` |

## Porta

| Serviço | Porta |
| --- | --- |
| Sample Vite | 43123 |

## Hooks

- husky `pre-commit`: lint-staged (Biome).
- husky `pre-push`: `scripts/check-quick`.
- Claude Code `PostToolUse`: [scripts/hooks/format-edited.mjs](../../scripts/hooks/format-edited.mjs).
- Agente não usa `--no-verify`.

## CI

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): rascunho não roda; diff só docs/md → harness + format; um job de qualidade (`check-quick`); E2E `continue-on-error`.

## Env

Leitura de ambiente só em `**/env.ts`. Copie `.env.example`. Sem secret de produção na VM do agente. MCP: [`.mcp.json`](../../.mcp.json) com `${LINEAR_API_KEY}`.
