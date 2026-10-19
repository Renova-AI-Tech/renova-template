# Estratégia de teste

Pastas (layout de mercado):

| Pasta | Oráculo | No `check:quick`? |
| --- | --- | --- |
| `tests/unit` | o que *deve* acontecer (exemplo) | sim |
| `tests/property` | o que *nunca* pode quebrar (`fast-check`, seed) | sim |
| `tests/integration` | I/O isolado | só `check:full` |
| `tests/e2e` | jornada real | `check:full`; CI **não** bloqueante |

E2E > propriedade > exemplo. Mock que o agente escreveu não é ground truth.

## Comandos

`pnpm test:loop` = unit + property. `pnpm check:quick` inclui o loop. Timeouts são contrato: todo `vitest*.config.*` declara `testTimeout` / `hookTimeout`. Sem `retries` no caminho principal.

## Armadilhas (falha real → teste)

| Incidente | O que o agente fez | O que recusa agora |
| --- | --- | --- |
| Asserção tautológica | `toBeGreaterThan(0)` em dinheiro | conservação em `tests/property` + contraexemplo em `tests/unit` |
| % por parcela somado | exemplos inventados | `percentOfCents` uma vez no total |
| Relógio / `Math.random` no teste | green irreprodutível | `test-nondeterminism` |
| Timeout default 5s | retry da suíte | `test-timeout` |
| Integração “fica com o CI” | vermelho horas depois | receita: arquivo dono no Done |

Próxima falha: skill [failure-to-rule](../../.agents/skills/failure-to-rule/SKILL.md), não um parágrafo novo.
