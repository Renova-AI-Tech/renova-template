# Progresso das sessões

Cada sessão longa acrescenta um bloco no topo. Não apague histórico.

## 2026-10-19 — merge e clone de outro projeto

- PR #1 mergeada em `5a6ea26`; template privado habilitado no GitHub.
  CI Blacksmith verde tanto na PR quanto na main, 212 testes.
- Clone real do remoto, agente em contexto novo e setup interativo com nome/confirmar.
  Catálogo independente com nova tabela, API tipada, busca/filtro e DS reutilizado.
- Full do catálogo: **220/220**; repetição do setup preservou código, credenciais e
  dados. Ambiente original preservado. [Evidências](../specs/renova-project-template/simplification-validation.md).
- README esclarece adaptação dos contratos de exemplo e distingue plano de origem
  do backlog do novo produto. Nenhum gerador, regra ou dependência adicional.
- Ensaio de agente em macOS com ferramentas instaladas; autenticação, Railway,
  CI em outro repositório e aceite humano não foram executados.

## 2026-10-19 — revisão da PR e gate final

- PR #1 aberta; Blacksmith aprovou o commit `b26438c` (205 testes).
- Revisão remota gerou correções pequenas no DS: largura da sidebar sem provider
  e fallback da legenda. Origem divergente em escrita sem cookie passou a ser recusada;
  chamadas públicas sem Origin e proteção CSRF com cookie mantidas.
- Revisão independente sem achados; largura real conferida em navegador.
  Full após correções: **212/212**, lint/types/build verdes.
- Testes de migrations acompanham quantidade/versão do manifesto; uma nova tabela
  não deve exigir alterar expectativas fixas do motor. Proteções preservadas.
- CI do commit final será reconferido antes do merge; clone de ensaio vem depois.

## 2026-10-19 — simplificação e preparação da PR

- Configurador pede somente nome e confirmação; JSON mantém rejeição de opções
  futuras. Mensagens de recuperação encaminham a setup/doctor.
- Nome curto, numérico, reservado ou longo gera identificador seguro automaticamente;
  correção encontrada pela revisão independente e coberta por testes.
- Exemplo financeiro retirado com seus workspaces, porta, specs e testes exclusivos.
  Lista de features inicia vazia por autorização explícita, sem herdar passes do sample.
  Propriedades agora exercitam o manifesto real; gates e proteções foram mantidos.
- Readiness verifica migrations sem depender de tabela demonstrativa. Regressão
  com migration de remoção passou em Postgres real, junto das negativas de segurança.
- Full local: **191/191** antes do ajuste de nomes; depois configuração/prompts
  **28/28** e Quick **102/102**, sem falhas. Revisão independente liberou as correções.
  [Evidências e limites](../specs/renova-project-template/simplification-validation.md).
- Entrega corrigiu symlink Claude, CODEOWNERS de exemplo, README da integração,
  script morto e placeholder sem uso; scan não encontrou segredos ou estado local
  nos arquivos candidatos. Artefatos de build/testes permanecem ignorados.
- Usuário autorizou commit/push/PR/merge após gates e um clone de ensaio posterior.
  CI remoto será conferido no commit da PR. Sem autenticação ou deploy Railway.

## 2026-10-19 — desenvolvimento sem ferramenta de tarefas obrigatória

- Usuário autorizou remover Linear deste repositório e dos clones. Pedido ou spec
  local orienta o trabalho; branch e PR têm nomes descritivos, sem ID obrigatório.
  Esta decisão substitui as notas históricas abaixo sobre vínculo Linear pendente.
- Removidos o servidor MCP nos dois arquivos de configuração, o manual específico
  e os placeholders de time/item. `develop-feature` substitui `feature-from-issue`;
  README, AGENTS, processos, templates, plano e script de início foram alinhados.
- Harness, proteções, testes e workflow Blacksmith preservados. Nenhum outro
  ponto da auditoria de simplicidade foi implementado nesta alteração.
- `pnpm check:quick` passou: links/índice, lint, tipos e 101 testes (37 harness,
  49 unit/property, 15 UI). MCPs equivalentes e apenas com Playwright; `bash -n`
  no init e `git diff --check` passaram. Busca sem credencial, endpoint ou placeholder
  ativo do serviço removido. As menções anteriores são histórico, não pré-requisito.
- Frontmatter/nome/descrição das duas skills editadas validados com o parser YAML
  já instalado no repo. O validador Python da skill não executou por falta de PyYAML;
  nenhuma dependência foi instalada para essa checagem.
- Revisão independente sem achados: conferiu o fluxo sem tracker e 106 links locais
  em 21 documentos, sem links quebrados ou exigência externa ativa.
- Não executados: integração, navegador, setup completo ou CI remoto, pois a mudança
  limita-se a instruções, configuração MCP e mensagem de início. Sem commit/push/deploy.

## 2026-10-19 — guia inicial substituível

- A pedido do usuário, `/` agora começa com um guia curto: explorar a referência,
  explicar a ideia para a IA e substituir o guia pela primeira tela do produto.
- Logo oficial, exemplo de pedido para IA e ajuda de ambiente recolhida; sem
  carregar o catálogo de componentes nem consultar a API demonstrativa.
- README, AGENTS, arquitetura, feature map e spec atualizados para humanos e IA.
  O contrato anterior de raiz vazia permanece apenas nos registros históricos.
- `pnpm check:quick`, build do frontend e **16/16 E2E** passaram. Imagens de
  1440 e 390 px inspecionadas; navegação, ausência de overflow e abertura da ajuda
  pelo teclado verificadas. React Doctor: **100/100**, sem diagnósticos.
- Revisão independente somente leitura não encontrou barreira concreta.
  O Full anterior de 204 testes não foi repetido para este ajuste de interface.
  Autenticação, Railway, CI remoto e aceite humano continuam pendentes.
- Sem commit, push ou deploy; WIP e ambiente local preservados.

## 2026-10-19 — configurador, diagnóstico e referência

- T-011–T-014 e T-031 concluídos na mesma branch local, preservando WIP anterior.
- `pnpm run setup`: três escolhas, plano sem escrita, JSON para IA, preparação
  retomável com lockfile, Postgres e migrations. Só sem login/local disponíveis.
- `pnpm run doctor`: diagnóstico sanitizado somente leitura, códigos 0/1/2,
  próximos passos e distinção entre local pronto e CI/Railway não verificados.
- `/` livre para o produto; `/referência` e `/referencia` reúnem exemplos, galeria,
  logo oficial e sidebar refinada. README/AGENTS/feature map orientam humanos e IA.
- Full independente: **204 testes** (37 harness, 49 loop, 15 UI, 87 integração,
  16 E2E), sem falhas/skips. Sensor: **3/3 mortos**, árvore e ambiente preservados.
  [Relatório com assertions](../specs/renova-project-template/onboarding-validation.md).
- Clone limpo exercitado em PTY com Node/pnpm/Docker reais; repetição declarativa
  preservou código, lockfile, credenciais e identidade. Doctor passou com serviços
  ligados e desligados. Clone e recursos Docker exclusivos do ensaio foram removidos.
- Corrigidos proxy presumido pelo diagnóstico e guard CLI por alias de diretório,
  com regressões reais. React Doctor frontend 100/100, sem diagnósticos.
- Um rerun concorrente do subagente teve timeout no bootstrap; não mudou timeout
  nem gate. Full independente posterior passou; recursos descartáveis foram limpos.
- Auth, CI remoto Blacksmith, Railway e aceite humano não executados. Sem commit,
  push ou deploy. `feature-list.json` preservado; vínculo Linear continua pendente.

## 2026-10-19 — base local Renova implementada

- Plano aprovado; incremento T-000–T-010 em `codex/renova-local-foundation`,
  base `d0c2db9`, preservando a documentação anterior e o sample.
- Entregues Vite/React, Fastify/tRPC, Postgres isolado, migrations com integridade,
  papéis separados e perfil público somente leitura. 22 componentes do DS Renova,
  fontes locais, shell responsivo e galeria integrada.
- `pnpm check:full` independente: 141 testes, build/lint/types verdes, sem skip.
  Sensor isolado: 3/3 falhas detectadas. [Relatório](../specs/renova-project-template/local-validation.md).
- Correções encontradas na revisão ganharam regressões: erro de URL malformada,
  falsa evidência em comentário/string, import dinâmico em template literal e
  encerramento de processos de desenvolvimento/teste.
- Workflow Blacksmith configurado e testado localmente, sem execução remota.
- DB local deste projeto permanece preparado; `pnpm dev` abre a base. Testes
  descartáveis não reutilizam esse banco. Guia e comandos no README/operations.
- Próximas etapas: configurador/doctor, perfil autenticado e geração; depois
  containers, piloto CI/Railway e aceite humano nas condições do plano.
- Sem commit, push, PR, deploy ou dados remotos. Vínculo Linear permanece pendente
  para publicação. `feature-list.json` preservado, sem reaproveitar passes do sample.

## 2026-10-19 — proposta da base Renova

- Criados [requisitos](../specs/renova-project-template/requirements.md),
  [pesquisa](../specs/renova-project-template/research.md),
  [contexto](../specs/renova-project-template/context.md),
  [design](../specs/renova-project-template/design.md) e
  [plano](../specs/renova-project-template/tasks.md).
- Usuário confirmou dois perfis prontos sem login/com login, com evolução posterior.
- Confirmados Blacksmith no CI e contas liberadas pelo responsável, sem cadastro público.
- Branch documental local `codex/renova-template-spec`, base `d0c2db9`.
  Sem item remoto criado, implementação, commit, push ou deploy.
- Resultado documental e limites em [review](../specs/renova-project-template/review.md).
- `feature-list.json` preservado: os passes existentes pertencem ao sample,
  não comprovam a proposta nova.

## 2026-10-15 — template

- Layout alinhado ao padrão de mercado (AGENTS.md mapa, docs/ indexado, 3 skills, check-quick/full).
- Sample money + UI 43123 verdes em `test:loop` / `check:quick`.
- E2E existe; não entra no pre-push.
