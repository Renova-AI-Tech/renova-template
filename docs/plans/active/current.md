# Estado atual

O que **existe** neste clone vs. o que está **decidido**. Objetivos e pendências
ficam nos planos locais; ferramenta externa de tarefas é opcional.

## Existe

- Monorepo pnpm: `@renova/frontend` (Vite/React), `@renova/backend` (Fastify/tRPC),
  `@renova/ui`, `@renova/db-types` e `@renova/dbmigrator`.
- Postgres Docker isolado por clone, papéis separados e migrations com lock/checksum.
- Perfil público somente leitura com três exemplos sintéticos em `/referência`
  (alias `/referencia`). `/` começa com um guia substituível pelo produto. Sem auth instalada.
- Configurador `pnpm run setup`: nome + confirmação ou JSON, plano sem escrita e
  preparação retomável. `pnpm run doctor` oferece diagnóstico somente leitura
  em texto ou JSON, com próximos passos.
- Logo oficial Renova local, sidebar refinada e galeria separada do produto.
- Harness + `harness.rules.mjs`.
- `scripts/check-quick` / `check-full` / `init.sh`.
- Três skills em `.agents/skills/`.
- Templates de spec para as features de cada projeto; sem aplicação financeira extra.
- Transformação em [base Renova](../../specs/renova-project-template/requirements.md),
  com [design](../../specs/renova-project-template/design.md) e
  [tarefas](../../specs/renova-project-template/tasks.md). O incremento local passou
  na [validação independente](../../specs/renova-project-template/local-validation.md):
  141 testes e 3/3 falhas controladas detectadas. O incremento posterior de
  [onboarding e referência](../../specs/renova-project-template/onboarding-validation.md)
  passou em 204 testes e 3/3 falhas controladas detectadas. O plano completo inclui
  geração dos dois perfis, auth e publicação futuras.
- [Simplificação validada localmente](../../specs/renova-project-template/simplification-validation.md):
  configurador só pede nome, readiness não exige tabela de exemplo, legado retirado.
- Workflow Blacksmith preparado, E2E bloqueante e agregador que recusa skip/falha.
  Resultados remotos são registrados na PR do commit correspondente.

## Decidido

- Docs em pt-BR; código em inglês.
- Pedido ou spec local → alteração com objetivo claro → validação. PR com título
  descritivo quando solicitado, sem exigir ferramenta de tarefas ou ID externo.
- Agente não é dono do veredito.
- Direção confirmada em 19/10/2026: projetos independentes, design system
  integrado, uso local ou Railway e dois perfis iniciais sem login/com login.
  CI usa Blacksmith; no perfil com login, o responsável libera as contas, sem cadastro público.
  Plano aprovado e implementação da base local autorizada na sequência.

## Em aberto (projeto real)

- [ ] Personalizar nome/slug no setup e responsáveis de revisão, quando aplicável.
- [ ] Validar onboarding com pessoas técnicas e não técnicas; ensaio de agente não substitui aceite humano.
- [ ] Ativar CODEOWNERS com usuários reais se o projeto quiser revisão por responsáveis.
- [ ] Fechar método de autenticação/email e destino/acesso/custo Railway nas etapas próprias.
