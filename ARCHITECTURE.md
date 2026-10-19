# Arquitetura

{{PROJECT}} — monorepo pnpm. Dependências só **para baixo**.

```
apps/sample  →  packages/money
tests/*      →  apps/* | packages/*
scripts/harness  (sem importar apps)
```

`packages/*` **não** importa `apps/*`. O harness (`import-direction`) recusa o desvio.

## Domínios

| Pasta | Papel | Pode |
| --- | --- | --- |
| `packages/money` | Conta pura em centavos inteiros | Zero I/O, zero `process.env`, zero relógio |
| `apps/sample` | UI mínima para E2E ser real | Só orquestra; não reimplementa conta |
| `tests/unit` | Exemplos escolhidos | Rápido, determinístico |
| `tests/property` | Invariantes (`fast-check`, seed fixa) | Sem DB |
| `tests/integration` | I/O isolado (vazio neste template) | Banco `_test` quando existir |
| `tests/e2e` | Jornada ouro (Playwright) | Sem `waitForTimeout`, sem retry |
| `scripts/harness` | Motor de regras objetivas | Plugin em `harness.rules.mjs`, não domínio de cliente |

## Invariantes (checagem)

| Invariante | Onde |
| --- | --- |
| Soma das parcelas = total; resto na última | `tests/property/money.property.test.ts` |
| BRL ↔ centavos ida e volta | idem |
| Percentual arredonda **uma vez** no total | `tests/unit/money.test.ts` (contraexemplo) + property |
| Env só em `**/env.ts` | regra `env-centralized` |
| Sem `console.log` em src | regra `no-console` |
| Vitest com `testTimeout` explícito | regra `test-timeout` |

Glossário curto: **centavo** = inteiro seguro; **bps** = 1/100 de ponto percentual (1500 = 15%); **{{LINEAR_TEAM}}** / **{{ISSUE_PREFIX}}** = [docs/process/linear-conventions.md](docs/process/linear-conventions.md).
