# Estratégia de teste

Pastas (layout de mercado):

| Pasta | Oráculo | No `check:quick`? |
| --- | --- | --- |
| `tests/unit` | o que *deve* acontecer (exemplo) | sim |
| `tests/property` | o que *nunca* pode quebrar (`fast-check`, seed) | sim |
| `tests/integration` | I/O isolado | só `check:full` |
| `tests/e2e` | jornada real | `check:full`; passo do job `required` em PR de código |

E2E > propriedade > exemplo. Mock que o agente escreveu não é ground truth.

## Comandos

`pnpm test:loop` = unit + property + UI. `pnpm check:quick` inclui o loop. Timeouts são contrato: todo `vitest*.config.*` declara `testTimeout` / `hookTimeout`. Sem `retries` no caminho principal.

`pnpm test:integration` e `pnpm test:e2e` criam banco e portas próprios, aplicam
migrations e removem exclusivamente o alvo de teste ao finalizar. Não usam o .env
de desenvolvimento. O E2E executa somente o frontend e backend da base Renova:
Playwright sobe `node apps/backend/dist/index.js` na porta da API e
`vite preview` do `dist` na `FRONTEND_URL`, com proxy `/api` (cookies na origem
do browser, assets fora do rate limit do Fastify). Sem o build, o runner executa
`pnpm build` antes. Cada arquivo E2E inicia um servidor novo para não consumir
o limite de IP das outras jornadas. Os controles de abuso continuam ativos;
artefatos ficam em `test-results/suite-N/`. Use o runner do projeto para
preservar esse isolamento. O caminho feliz da base usa API e Postgres reais;
interceptação de transporte serve apenas aos estados negativos de UI e não
substitui a prova de integração. A imagem Docker (`test:containers`) é outro
oráculo: segredos, SPA na origem de produção e SIGTERM.

`pnpm check:full` exige build, integração e navegador: a antiga variável SKIP_E2E
não reduz esse gate. `pnpm ci:local` tem nome próprio e comprova apenas quick + DB.

## Armadilhas (falha real → teste)

| Incidente | O que o agente fez | O que recusa agora |
| --- | --- | --- |
| Asserção tautológica | exemplos que não distinguem erro | Propriedades de preservação do manifesto em `tests/property/project-config.property.test.ts` e entradas negativas em `tests/unit/project-config.test.ts` |
| Relógio / `Math.random` no teste | green irreprodutível | `test-nondeterminism` |
| Timeout default 5s | retry da suíte | `test-timeout` |
| Integração “fica com o CI” | vermelho horas depois | receita: arquivo dono no Done |

Próxima falha: skill [failure-to-rule](../../.agents/skills/failure-to-rule/SKILL.md), não um parágrafo novo.
