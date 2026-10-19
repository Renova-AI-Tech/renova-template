# TASKS: base independente de projetos Renova

Spec: [requirements.md](requirements.md). Design: [design.md](design.md).
Estado do plano: implementação local autorizada em 19/10/2026, começando pela
base Vite/Fastify/Postgres/UI. Publicação e operações remotas não iniciadas.

## Execution Protocol

Usar regras e skills que acompanham este repositório. TLC organizou esta proposta,
mas o clone gerado não depende de instalar uma skill pessoal. Manter a fonte em
`docs/specs/`, sem uma árvore paralela `.specs/`.

Usuário aprovou o plano e sua implementação local nesta sessão. Preparar o
incremento local na branch `codex/renova-local-foundation`, preservando o planejamento
existente. Pedido/spec local basta; ferramenta de tarefas ou vínculo externo não é obrigatório.
Commit, push, PR, merge, custo, deploy e dados remotos têm autorizações próprias.

S0 fecha: proposta de perfil público somente leitura, método de login,
biblioteca após spike, entrega de email e responsáveis. Destino Railway, orçamento
e acesso são exigidos antes da execução remota. Sem isso, continuar entregas
locais independentes; não marcar piloto remoto ou humano como concluído.
Entrada fechada com contas liberadas pelo responsável e Blacksmith no CI já estão
confirmados. Habilitação Blacksmith por repo e budget são condições do piloto CI.

Cada tarefa entrega comportamento e seus testes na mesma alteração. Preservar
WIP e rever diff. Não enfraquecer checks. Atualizar status somente com comando
verde e evidência pertinente; docs/checks estruturais não provam runtime.

## Test Coverage Matrix

Derivada de `AGENTS.md`, `docs/process/testing-strategy.md`, `package.json`,
`scripts/check-quick`, `vitest.loop.config.ts`, `playwright.config.ts`, testes
unit/property/E2E da base e testes do harness. A remoção autorizada do exemplo
financeiro retira apenas os seus testes; gates e testes de proteção permanecem.

| Camada | Tipo obrigatório | Cobertura esperada | Padrão de localização | Comando |
| --- | --- | --- | --- | --- |
| Configuração e planos puros | unit/property | Válido, inválido, limites, ausência de escrita | tests/unit, tests/property | pnpm test:loop |
| API e políticas | integration | Sucesso, erro, negação e efeito no DB/handler | tests/integration | pnpm test:integration |
| DB e migrations | integration | Persistência, integridade, concorrência e alvo proibido | tests/integration | pnpm test:integration |
| UI e acesso | e2e | Navegador real, teclado, mobile e falhas | tests/e2e | pnpm test:e2e |
| Geração | integration + e2e | Ambos os perfis, lockfile, independência e ausência de auth | tests/profiles | pnpm test:profiles |
| Imagens | container + e2e | Build, proxy, startup, segredo sentinela e schema | tests/integration, tests/e2e | pnpm test:containers |
| Deploy driver | integration com fake de transporte | Autoridade, falha parcial e retry; não prova provedor | tests/integration | test:integration filtrado |
| Railway | provider + e2e | Serviços reais isolados e jornada nos dois perfis | tests/e2e/railway-pilot.spec.ts | Gate Remote |
| Documentação | documental/jornada | Links e execução dos comandos reais | docs e testes existentes | Gate Docs |
| Experiência humana | aceite humano | Participantes reais e intervenções registradas | relatório de aceite | Gate Acceptance |

## Gate Check Commands

Comandos marcados como futuros NÃO existem ainda. Cada um é criado antes ou
na tarefa que primeiro o utiliza. Não simular sua existência durante esta rodada.

| Gate | Comando / evidência | Disponibilidade |
| --- | --- | --- |
| Quick | `pnpm check:quick` | Existente; requer dependências instaladas |
| Build | `pnpm build && pnpm test:integration && pnpm check:quick` | Integração criada em T-002, build ampliado em T-002/T-006 |
| Integration | `pnpm test:integration && pnpm check:quick` | Comando/config de integração criados em T-002 |
| Browser | `pnpm test:e2e && pnpm check:quick` | Existente; alvo real adaptado em T-006 |
| Full | `pnpm check:full` | Existente; integração corrigida em T-010 |
| Spike | Runner Vitest do experimento T-015 + relatório da prova e decisão | Criado em T-015, não implica adoção automática |
| Profiles | `pnpm test:profiles && pnpm check:full` | Futuro T-019 |
| CI | Gates locais + execução Blacksmith/GitHub no SHA autorizado, com cache frio e falha/cancelamento/skip | Config T-020; execução remota exige App habilitado no repo e autorização |
| Containers | `pnpm test:containers && pnpm check:full` | Futuro T-021; Docker isolado |
| DeployDriver | `pnpm test:integration -- deploy-driver && pnpm check:quick` | Futuro T-025; fake só comprova lógica |
| Remote | `pnpm deploy:prepare`, apply autorizado e `pnpm deploy:verify`; Playwright no alvo explícito | Futuros T-024/T-025/T-026 |
| Docs | `pnpm harness:check`, revisão de links/comandos e jornada já implementada | Sem testes artificiais que repitam texto |
| Acceptance | Gates do pacote + relatório humano + verificação independente/sensor em scratch | Exige participantes reais; não substituível por agente |

## Execution Plan

Incrementos permitem demonstração antes de ampliar capacidade. P1 completo exige
fases 0–6, incluindo piloto remoto; fase 7 entrega P2. Fase 0 antecede as demais.
A extração T-008 pode avançar após T-001 junto da fundação, com ownership isolado;
integração visual T-009 continua aguardando suas dependências e Gate Browser.
As demais fases 1–4 seguem em ordem.
Depois da fase 4, fases 5 e 6 podem avançar independentemente pelas dependências
explícitas: documentação e aceite local não aguardam autorização remota. O
complemento Railway e sua evidência entram em T-026; sem ele só a base local é
declarada validada. Dentro de cada frente, somente tarefas com dependências
concluídas e ownership disjunto podem executar em paralelo.
Root manifests, lockfile, scripts de gates e documentação consolidada
têm um integrador; subagentes devolvem alterações de dependência para ele.
Por solicitação explícita de Blacksmith, a configuração local do workflow foi
antecipada junto dos gates. Isso não conclui T-020: matriz de perfis gerados,
App habilitado e execução remota continuam dependendo das fases posteriores.

### Phase 0: Evidência antes da implementação

T-000.

### Phase 1: Fundação executável

T-001, T-002, T-003, T-004, T-005, T-006, T-007.

### Phase 2: Identidade visual e harness

T-008, T-009, T-010.

### Phase 3: Configuração e diagnóstico

T-011, T-012, T-013, T-014.

T-031 é o refinamento visual solicitado na continuação e pode avançar em paralelo,
pois depende apenas da base local já validada e possui ownership separado.

### Phase 4: Perfil com login

T-015, T-016, T-017, T-018, T-019.

### Phase 5: Entrega e Railway

T-020, T-021, T-022, T-023, T-024, T-025, T-026.

### Phase 6: Manutenção e aceite

T-027, T-028, T-029.

### Phase 7: Evolução posterior

T-030.

## Phase Execution Map

Todas as arestas abaixo correspondem exatamente a Depends on. T-000 é a raiz.

```text
T-000 -> T-001
T-001 -> T-002
T-002 -> T-003
T-001 -> T-004
T-002 -> T-004
T-002 -> T-005
T-004 -> T-005
T-002 -> T-006
T-003 -> T-007
T-005 -> T-007
T-006 -> T-007
T-001 -> T-008
T-006 -> T-009
T-007 -> T-009
T-008 -> T-009
T-001 -> T-010
T-002 -> T-010
T-009 -> T-010
T-001 -> T-011
T-010 -> T-011
T-009 -> T-031
T-010 -> T-031
T-001 -> T-012
T-011 -> T-012
T-004 -> T-013
T-005 -> T-013
T-011 -> T-013
T-012 -> T-013
T-013 -> T-014
T-003 -> T-015
T-005 -> T-015
T-006 -> T-015
T-015 -> T-016
T-016 -> T-017
T-016 -> T-018
T-011 -> T-019
T-017 -> T-019
T-018 -> T-019
T-019 -> T-020
T-019 -> T-021
T-005 -> T-022
T-016 -> T-022
T-021 -> T-022
T-005 -> T-023
T-022 -> T-023
T-020 -> T-024
T-022 -> T-024
T-023 -> T-024
T-024 -> T-025
T-025 -> T-026
T-014 -> T-027
T-019 -> T-027
T-011 -> T-028
T-019 -> T-028
T-027 -> T-029
T-028 -> T-029
T-016 -> T-030
T-019 -> T-030
T-028 -> T-030
T-029 -> T-030
```

## Task Breakdown

Nomes de testes e paths são contratos planejados. Nos passos com inspeção manual,
o teste indicado só comprova a parte automática; evidência humana/provedor deve
ser registrada separadamente. O ajuste T-000 deve reconhecer essa distinção sem
inventar testes para satisfazer o parser atual.

## T-000 — Preparar o contrato de evidências do harness

- **Status:** done
- **Ownership:** `scripts/harness/rules/spec-tests.mjs` e testes diretamente relacionados.
- **What:** Ler o campo Test explicitamente, reconhecer Vitest/Playwright e distinguir evidência documental/humana/provedor sem inventar teste automático.
- **Depends on:** None
- **Requirement:** REQ-040
- **Done when:** Parser não confunde path de Ownership com teste; aceita runners previstos; rejeita nome/arquivo ausente, campo incorreto e aceite humano sem relatório; o próprio gate valida esta tarefa antes de iniciar T-001.
- **Tests:** unit; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Quick (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('valida campo de evidencia e runner sem escolher ownership')` em `scripts/harness/check.test.mjs`.

## T-001 — Definir o schema do projeto

- **Status:** done
- **Ownership:** `scripts/project/config.mjs` e testes diretamente relacionados.
- **What:** Parser fechado do manifesto e catálogo de dois perfis; versões/origem e nomes válidos.
- **Depends on:** T-000
- **Requirement:** REQ-002, REQ-003, REQ-037
- **Done when:** Manifesto válido produz configuração canônica; campo desconhecido, path traversal e perfil inconsistente falham sem I/O.
- **Tests:** unit; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** Quick (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('recusa manifesto invalido sem alterar arquivos')` em `tests/unit/project-config.test.ts`.

## T-002 — Criar o bootstrap Fastify com env validado

- **Status:** done
- **Ownership:** `apps/backend` e testes diretamente relacionados.
- **What:** Bootstrap compilável, env central e configuração Vitest de integração explícita; criar test:integration junto desta entrega.
- **Depends on:** T-001
- **Requirement:** REQ-001, REQ-021
- **Done when:** API inicia com configuração válida; produção insegura falha antes de escutar; build e coleta de integração executam casos reais.
- **Tests:** integration; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('recusa producao com configuracao insegura')` em `tests/integration/backend-bootstrap.test.ts`.

## T-003 — Registrar políticas e limites da API

- **Status:** done
- **Ownership:** `apps/backend/src/server` e testes diretamente relacionados.
- **What:** Plugin de registro com política obrigatória, limites, origem/CSRF e erros/logs sanitizados.
- **Depends on:** T-002
- **Requirement:** REQ-013, REQ-017, REQ-019, REQ-020
- **Done when:** Operação sem política é recusada; tamanho, frequência e origem inválidos não executam handler; sentinelas não vazam.
- **Tests:** integration; pelo menos 8 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('nega mutation de origem indevida antes do handler')` em `tests/integration/security.test.ts`.

## T-004 — Isolar o Postgres local e os alvos de teste

- **Status:** done
- **Ownership:** `scripts/db` e testes diretamente relacionados.
- **What:** Contrato de Compose, portas/volumes por projeto e guard de alvo antes de qualquer escrita.
- **Depends on:** T-001, T-002
- **Requirement:** REQ-007, REQ-023
- **Done when:** Dois projetos não compartilham DB/volume; serviço expõe loopback; alvo proibido falha sem conexão de escrita e sem matar processo ocupante.
- **Tests:** integration; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('isola dois projetos locais e recusa alvo proibido')` em `tests/integration/local-db.test.ts`.

## T-005 — Entregar runner de migrations e readiness

- **Status:** done
- **Ownership:** `packages/dbmigrator` e testes diretamente relacionados.
- **What:** Migrations mínimas, integridade de histórico e lock; contrato de readiness consumido pelo backend.
- **Depends on:** T-002, T-004
- **Requirement:** REQ-022, REQ-028
- **Done when:** Banco vazio evolui, reexecução não duplica e corrida não aplica em paralelo; falha/integridade incorreta torna readiness indisponível.
- **Tests:** integration; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('serializa migrations e recusa historico alterado')` em `tests/integration/migrations.test.ts`.

## T-006 — Ligar o frontend ao contrato tipado da API

- **Status:** done
- **Ownership:** `apps/frontend` e testes diretamente relacionados.
- **What:** Entrada Vite, providers e transporte tRPC de mesma origem; build de contrato sem iniciar servidor.
- **Depends on:** T-002
- **Requirement:** REQ-001
- **Done when:** Frontend compilado consome uma resposta real; erro de contrato quebra typecheck; navegador não recebe implementação/segredo do backend.
- **Tests:** integration; pelo menos 3 cenários nomeados, contagem real registrada na execução.
- **Gate:** Build (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('consome contrato tipado sem carregar backend no browser')` em `tests/integration/transport.test.ts`.

## T-007 — Entregar a consulta demonstrativa pública

- **Status:** done
- **Ownership:** `apps/backend/src/modules/example` e testes diretamente relacionados.
- **What:** Endpoint de listagem paginada de conteúdo público sintético; nenhuma mutation de negócio.
- **Depends on:** T-003, T-005, T-006
- **Requirement:** REQ-012
- **Done when:** Consulta retorna apenas dados sintéticos; métodos de escrita são recusados; nenhuma tabela/rota de identidade existe no perfil.
- **Tests:** integration; pelo menos 4 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('perfil publico consulta dados sinteticos sem writer')` em `tests/integration/public-profile.test.ts`.

## T-008 — Extrair o pacote visual Renova

- **Status:** done
- **Ownership:** `packages/ui` e testes diretamente relacionados.
- **What:** Importar pacote visual de revisão aprovada, fontes e tokens próprios; remover defaults e CSS dependentes do produto.
- **Depends on:** T-001
- **Requirement:** REQ-009
- **Done when:** Pacote renderiza isolado, carrega fontes e não importa apps, auth ou domínios Renova; origem/licença registradas.
- **Tests:** unit + browser; pelo menos 4 cenários nomeados, contagem real registrada na execução.
- **Gate:** Browser (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `test('carrega fontes e componentes sem CSS de outra aplicacao')` em `tests/e2e/design-system.spec.ts`.

## T-009 — Compor o shell e catálogo inicial

- **Status:** done
- **Ownership:** `apps/frontend/src` e testes diretamente relacionados.
- **What:** Composição navegável usando somente UI integrada, com exemplo público e estados de interface.
- **Depends on:** T-006, T-007, T-008
- **Requirement:** REQ-010
- **Done when:** Catálogo e página consomem API real; teclado, foco, drawer e viewport 390 px funcionam; zero conteúdo de pessoa/empresa da origem.
- **Tests:** e2e; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Browser (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `test('mantem shell e galeria utilizaveis em 390 pixels')` em `tests/e2e/design-system.spec.ts`.

## T-010 — Adaptar o harness às aplicações reais

- **Status:** done
- **Ownership:** `scripts/harness` e testes diretamente relacionados.
- **What:** Descobrir workspaces e corrigir integração no check-full, preservando o contrato de evidência estabelecido em T-000.
- **Depends on:** T-001, T-002, T-009
- **Requirement:** REQ-001, REQ-032
- **Done when:** Renomear scope não evita regras; integração é coletada e falha de teste falha gate; evidência humana não é tratada como teste automático.
- **Tests:** unit + integration; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Full (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('preserva regras apos renomear os workspaces')` em `scripts/harness/check.test.mjs`.

## T-011 — Materializar configuração com preservação de arquivos

- **Status:** done
- **Ownership:** `scripts/project/generate.mjs` e testes diretamente relacionados.
- **What:** Planejador/aplicador de identidade com staging, hashes e receita local; os workspaces públicos já acompanham o clone e não são sobrescritos. Perfil sem login omite auth runtime.
- **Depends on:** T-001, T-010
- **Requirement:** REQ-003, REQ-005, REQ-018, REQ-036, REQ-037
- **Done when:** Plan não escreve; apply respeita raiz e symlinks; reaplicar é idempotente; conflito preserva árvore, env e Git.
- **Tests:** integration; pelo menos 7 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('gera perfil e preserva customizacoes em conflito')` em `tests/integration/profile-generation.test.ts`.

## T-012 — Criar as perguntas e a interface sem prompts

- **Status:** done
- **Ownership:** `scripts/project/prompts.mjs` e testes diretamente relacionados.
- **What:** Nome e confirmação do resumo; perfil/destino só são perguntados quando há alternativas implementadas. Execução declarativa sem TTY usa o mesmo schema.
- **Depends on:** T-001, T-011
- **Requirement:** REQ-002
- **Done when:** Nenhuma escolha técnica de ORM/provider é obrigatória; input ausente sem TTY retorna código 2; escolhas interativas e declarativas geram o mesmo plano. Nesta etapa, o resumo informa sem login/local; login/Railway são recusados no JSON antes de qualquer escrita.
- **Tests:** unit; pelo menos 4 cenários nomeados, contagem real registrada na execução.
- **Gate:** Quick (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('equivale escolhas interativas ao manifesto')` em `tests/unit/setup-prompts.test.ts`.

## T-013 — Orquestrar setup retomável

- **Status:** done
- **Ownership:** `scripts/project/setup.mjs`, preparação em `scripts/db/local.mjs` e testes diretamente relacionados.
- **What:** Sequência de instalação local, DB, migration e estado sanitizado de passos.
- **Depends on:** T-004, T-005, T-011, T-012
- **Requirement:** REQ-004, REQ-005, REQ-006
- **Done when:** Clone inicia sem contas externas; interrupção permite retomada; repetir não apaga volume nem sobrescreve segredo; falha mostra próximo passo.
- **Tests:** integration; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('retoma setup sem duplicar recursos ou apagar dados')` em `tests/integration/setup.test.ts`.

## T-014 — Entregar diagnóstico legível por humano e IA

- **Status:** done
- **Ownership:** `scripts/project/doctor.mjs` e testes diretamente relacionados.
- **What:** Checks de pré-requisitos, conflito de porta, env, DB e serviços; saída texto/JSON versionada.
- **Depends on:** T-013
- **Requirement:** REQ-008, REQ-020
- **Done when:** Diagnóstico retorna códigos definidos, causa e ação; não modifica projeto nem expõe sentinelas de segredo; é possível diagnosticar Docker indisponível.
- **Tests:** unit + integration; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('diagnostica falhas sem revelar segredos')` em `tests/unit/doctor.test.ts`.

## T-031 — Separar o produto da referência e aplicar a marca oficial

- **Status:** done
- **Ownership:** `apps/frontend`, assets de marca em `packages/ui` e testes de navegador relacionados.
- **What:** Mover a demonstração para `/referência`, oferecer alias `/referencia`, deixar `/` com um guia substituível pelo produto e refinar a barra lateral com a logo oficial extraída de revisão identificada do Renova Monorepo.
- **Depends on:** T-009, T-010
- **Requirement:** REQ-009, REQ-010, REQ-041, REQ-042, REQ-043
- **Done when:** Página inicial apresenta guia, acesso à referência e ajuda de ambiente sem catálogo nem chamada à API demonstrativa; referência abre diretamente e após refresh nos dois endereços; logo correta carrega localmente; sidebar, teclado, foco e 390 px passam; instruções de humano/IA apontam o arquivo do produto separado dos exemplos.
- **Tests:** e2e; pelo menos 4 cenários de rotas/marca além das jornadas existentes preservadas no novo endereço.
- **Gate:** Browser (comando da tabela; incluir build, lint/types aplicáveis).
- **Test:** `test('orienta o inicio do produto sem consultar API ou carregar referencia')` em `tests/e2e/reference-routing.spec.ts`.

## T-015 — Verificar o candidato de autenticação

- **Status:** todo
- **Ownership:** `tests/experiments/auth` e testes diretamente relacionados.
- **What:** Spike descartável Better Auth/Fastify/Postgres/tRPC/proxy/email; registrar ADR com método, biblioteca, provider e limites.
- **Depends on:** T-003, T-005, T-006
- **Requirement:** REQ-014
- **Done when:** Experimento comprova sessão, cookies múltiplos, origem, migration, ativação e recuperação; decisão de produto S0 confirmada antes de T-016.
- **Tests:** integration; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Spike (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('comprova integracao auth com Fastify e proxy')` em `tests/experiments/auth/auth-spike.test.ts`.

## T-016 — Integrar o módulo de identidade

- **Status:** todo
- **Ownership:** `templates/modules/auth/packages/auth` e testes diretamente relacionados.
- **What:** Receita do módulo de auth com identidade própria, sessão, provisionamento fechado, recuperação e migrations revisadas.
- **Depends on:** T-015
- **Requirement:** REQ-014, REQ-015, REQ-017, REQ-019
- **Done when:** Sem cadastro público ou senha padrão; expiração/logout/recuperação revogam sessão; tentativas e replay limitados; controles não dependem de esconder UI.
- **Tests:** integration; pelo menos 9 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('revoga sessao e bloqueia cadastro publico')` em `tests/integration/auth.test.ts`.

## T-017 — Entregar operação persistente por proprietário

- **Status:** todo
- **Ownership:** `templates/modules/auth/apps/backend/src/modules/example` e testes diretamente relacionados.
- **What:** Exemplo de criar/listar/editar registro com política explícita de propriedade no backend.
- **Depends on:** T-016
- **Requirement:** REQ-016
- **Done when:** Usuário A mantém registro após reiniciar API; B não lê/edita o registro de A mesmo conhecendo o ID; entrada inválida não grava.
- **Tests:** integration; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('isola registros entre dois usuarios')` em `tests/integration/owned-records.test.ts`.

## T-018 — Entregar a jornada de acesso e email local

- **Status:** todo
- **Ownership:** `templates/modules/auth/apps/frontend/src/features/auth` e testes diretamente relacionados.
- **What:** Composição de entrada, ativação, logout e recuperação; caixa de email local como dependência do perfil.
- **Depends on:** T-016
- **Requirement:** REQ-004, REQ-014
- **Done when:** Navegador conclui fluxo com mensagem capturada localmente; recuperação responde genericamente inclusive em falha de envio; diagnóstico administrativo distingue falha de aceitação sem expor conta; produção sem provider configurado é recusada.
- **Tests:** e2e; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Browser (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `test('ativa conta e recupera acesso por email local')` em `tests/e2e/auth.spec.ts`.

## T-019 — Validar os dois projetos gerados

- **Status:** todo
- **Ownership:** `tests/profiles` e testes diretamente relacionados.
- **What:** Runner test:profiles gera cada perfil em diretório limpo e executa seus gates com DB descartável.
- **Depends on:** T-011, T-017, T-018
- **Requirement:** REQ-001, REQ-014, REQ-018, REQ-033
- **Done when:** Perfil público não inclui auth runtime/schema; autenticado completa persistência e negativas; ambos instalam com lockfile e build sem repo irmão.
- **Tests:** integration + e2e; pelo menos 4 cenários nomeados, contagem real registrada na execução.
- **Gate:** Profiles (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('valida os dois perfis em clones independentes')` em `tests/profiles/generation.test.ts`.

## T-020 — Tornar CI um gate de publicação verificável

- **Status:** in_progress
- **Ownership:** `.github/workflows` e testes diretamente relacionados.
- **What:** GitHub Actions com runners Blacksmith por commit, E2E essencial bloqueante, agregador final e verificação de artefatos com sentinelas; diagnóstico e guia de habilitação por repo.
- **Depends on:** T-019
- **Requirement:** REQ-024, REQ-031, REQ-039
- **Done when:** Falha/cancelamento/skip obrigatório não resultam em apto; PR e push usam Blacksmith sem fallback; ambos os perfis passam com cache frio e DB novo; doctor diferencia CI pendente de local pronto; sentinelas são rejeitadas; registrar labels, duração e consumo observados sem prometer economia.
- **Tests:** unit + workflow; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** CI (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('recusa CI incompleto mesmo com workflow secundario verde')` em `tests/unit/ci-contract.test.ts`.

## T-021 — Empacotar frontend e proxy

- **Status:** todo
- **Ownership:** `Dockerfile.frontend` e testes diretamente relacionados.
- **What:** Imagem frontend com Caddy, roteamento /api, fallback SPA e regras de cache; criar test:containers.
- **Depends on:** T-019
- **Requirement:** REQ-024, REQ-027
- **Done when:** Assets ausentes retornam 404, rota profunda abre SPA, API mantém mesma origem; env/backend/sourcemap privado não chegam à imagem.
- **Tests:** container + e2e; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Containers (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `test('serve SPA e API na mesma origem sem segredo')` em `tests/e2e/container.spec.ts`.

## T-022 — Empacotar backend e declarar serviços

- **Status:** todo
- **Ownership:** `Dockerfile.backend` e testes diretamente relacionados.
- **What:** Imagem backend com runtime mínimo e configurações Railway dos dois serviços, raiz/watch paths e rede privada.
- **Depends on:** T-005, T-016, T-021
- **Requirement:** REQ-021, REQ-027
- **Done when:** Startup inválido falha, sinais encerram conexões, DB/backend não precisam de domínio público e dependências compartilhadas entram no build.
- **Tests:** container; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** Containers (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('inicia backend compilado com configuracao validada')` em `tests/integration/backend-container.test.ts`.

## T-023 — Conectar migration e readiness à publicação

- **Status:** todo
- **Ownership:** `scripts/deploy/predeploy.mjs` e testes diretamente relacionados.
- **What:** Etapa única de migration pré-deploy e readiness por versão esperada; contrato de rollback de imagem separado dos dados.
- **Depends on:** T-005, T-022
- **Requirement:** REQ-022, REQ-028
- **Done when:** Migration falha impede novo release; DB indisponível torna ready 503; release anterior mantém compatibilidade; nenhum rollback automático de DB.
- **Tests:** integration + container; pelo menos 5 cenários nomeados, contagem real registrada na execução.
- **Gate:** Containers (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('interrompe publicacao quando migration falha')` em `tests/integration/predeploy.test.ts`.

## T-024 — Gerar plano de instalação Railway

- **Status:** todo
- **Ownership:** `scripts/deploy/prepare.mjs` e testes diretamente relacionados.
- **What:** Preflight de acessos e destino explícitos, inventário somente leitura, plano sanitizado com hash/validade, SHA e hash do contexto ou digest da imagem a publicar.
- **Depends on:** T-020, T-022, T-023
- **Requirement:** REQ-025, REQ-030
- **Done when:** Prepare não muta; plano descreve recursos/custo sem estimativa inventada; destino ausente é erro; DB local não é fonte de carga.
- **Tests:** unit; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Quick (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('prepara plano railway sem mutacoes')` em `tests/unit/deploy-plan.test.ts`.

## T-025 — Aplicar plano remoto com retomada

- **Status:** todo
- **Ownership:** `scripts/deploy/apply.mjs` e testes diretamente relacionados.
- **What:** Driver Railway com autorização do plano atual, revalidação, IDs persistidos e tratamento de resultado desconhecido.
- **Depends on:** T-024
- **Requirement:** REQ-006, REQ-026, REQ-031
- **Done when:** Sem aprovação não há chamada de escrita; plano/commit/artefato alterado ou expirado falha; publicação exige checks obrigatórios verdes do SHA fixado antes da chamada; WIP não é publicado; retry consulta antes de criar; falha não apaga volume.
- **Tests:** integration; pelo menos 9 cenários nomeados, contagem real registrada na execução.
- **Gate:** DeployDriver (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('recusa plano sem aceite e retoma sem duplicar recurso')` em `tests/integration/deploy-driver.test.ts`.

## T-026 — Verificar pilotos remotos e recuperação

- **Status:** todo
- **Ownership:** `scripts/deploy/verify.mjs` e testes diretamente relacionados.
- **What:** Verificador e relatório por camada; pilotos isolados dos dois perfis somente com autorização remota e complemento do guia Railway com evidência real.
- **Depends on:** T-025
- **Requirement:** REQ-029, REQ-030, REQ-033
- **Done when:** CI do SHA, serviços, proxy, TLS e jornadas passam; backup restaura em destino descartável; relatório não confunde fake com provedor.
- **Tests:** provider + e2e; pelo menos 4 cenários nomeados, contagem real registrada na execução.
- **Gate:** Remote (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `test('verifica perfil publicado e sua jornada real')` em `tests/e2e/railway-pilot.spec.ts`.

## T-027 — Publicar as instruções que acompanham o clone

- **Status:** todo
- **Ownership:** `docs/process` e testes diretamente relacionados.
- **What:** Guia curto humano/IA, feature map, comandos, limites, revisão e ações locais/remotas; sem skill pessoal obrigatória.
- **Depends on:** T-014, T-019
- **Requirement:** REQ-011
- **Done when:** Comandos locais documentados existem; links passam; sessão sem histórico conclui a jornada local; comandos remotos só entram quando implementados e são qualificados como não verificados até T-026.
- **Tests:** documental + jornada; pelo menos 2 cenários nomeados, contagem real registrada na execução.
- **Gate:** Docs (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('valida os dois perfis em clones independentes')` em `tests/profiles/generation.test.ts`.

## T-028 — Definir atualização revisável da base

- **Status:** todo
- **Ownership:** `scripts/project/update-plan.mjs` e testes diretamente relacionados.
- **What:** Plano de atualização por versão/origem com relatório de diferenças, conflitos e responsáveis; sem apply forçado.
- **Depends on:** T-011, T-019
- **Requirement:** REQ-038
- **Done when:** Correção de UI/base gera diff revisável; arquivo customizado é conflito; política explica entrega por PR e tratamento de aviso de segurança.
- **Tests:** integration; pelo menos 4 cenários nomeados, contagem real registrada na execução.
- **Gate:** Integration (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('planeja atualizacao preservando arquivo customizado')` em `tests/integration/update-plan.test.ts`.

## T-029 — Conduzir aceite independente de criação

- **Status:** todo
- **Ownership:** `docs/specs/renova-project-template` e testes diretamente relacionados.
- **What:** Piloto de um técnico e uma pessoa com IA e verificação independente das evidências do pacote.
- **Depends on:** T-027, T-028
- **Requirement:** REQ-011, REQ-034
- **Done when:** Registrar tempo/intervenções sem inventar participantes; ambos criam projeto e primeira alteração com docs; falhas controladas são rejeitadas em scratch.
- **Tests:** aceite humano + discriminação; pelo menos 2 cenários nomeados, contagem real registrada na execução.
- **Gate:** Acceptance (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('valida os dois perfis em clones independentes')` em `tests/profiles/generation.test.ts`.

## T-030 — Planejar e adicionar auth a projeto existente

- **Status:** todo
- **Ownership:** `scripts/project/add-auth.mjs` e testes diretamente relacionados.
- **What:** Receita de evolução com inventário de dados/rotas, diff, política explícita e recusa de remoção automática.
- **Depends on:** T-016, T-019, T-028, T-029
- **Requirement:** REQ-035, REQ-036
- **Done when:** Plan preserva WIP; apply só ocorre com política aprovada e sem conflitos; registros anteriores não ganham dono inferido; remoção é recusada.
- **Tests:** integration + e2e; pelo menos 6 cenários nomeados, contagem real registrada na execução.
- **Gate:** Profiles (comando da tabela; incluir lint/types aplicáveis).
- **Test:** `it('adiciona auth sem inferir dono ou sobrescrever customizacao')` em `tests/integration/add-auth.test.ts`.

## Diagram-Definition Cross-Check

| Tarefa | Depends on | Entradas no diagrama | Resultado estrutural |
| --- | --- | --- | --- |
| T-000 | nenhuma | sem entrada | igual |
| T-001 | T-000 | T-000 | igual |
| T-002 | T-001 | T-001 | igual |
| T-003 | T-002 | T-002 | igual |
| T-004 | T-001, T-002 | T-001, T-002 | igual |
| T-005 | T-002, T-004 | T-002, T-004 | igual |
| T-006 | T-002 | T-002 | igual |
| T-007 | T-003, T-005, T-006 | T-003, T-005, T-006 | igual |
| T-008 | T-001 | T-001 | igual |
| T-009 | T-006, T-007, T-008 | T-006, T-007, T-008 | igual |
| T-010 | T-001, T-002, T-009 | T-001, T-002, T-009 | igual |
| T-011 | T-001, T-010 | T-001, T-010 | igual |
| T-012 | T-001, T-011 | T-001, T-011 | igual |
| T-013 | T-004, T-005, T-011, T-012 | T-004, T-005, T-011, T-012 | igual |
| T-014 | T-013 | T-013 | igual |
| T-031 | T-009, T-010 | T-009, T-010 | igual |
| T-015 | T-003, T-005, T-006 | T-003, T-005, T-006 | igual |
| T-016 | T-015 | T-015 | igual |
| T-017 | T-016 | T-016 | igual |
| T-018 | T-016 | T-016 | igual |
| T-019 | T-011, T-017, T-018 | T-011, T-017, T-018 | igual |
| T-020 | T-019 | T-019 | igual |
| T-021 | T-019 | T-019 | igual |
| T-022 | T-005, T-016, T-021 | T-005, T-016, T-021 | igual |
| T-023 | T-005, T-022 | T-005, T-022 | igual |
| T-024 | T-020, T-022, T-023 | T-020, T-022, T-023 | igual |
| T-025 | T-024 | T-024 | igual |
| T-026 | T-025 | T-025 | igual |
| T-027 | T-014, T-019 | T-014, T-019 | igual |
| T-028 | T-011, T-019 | T-011, T-019 | igual |
| T-029 | T-027, T-028 | T-027, T-028 | igual |
| T-030 | T-016, T-019, T-028, T-029 | T-016, T-019, T-028, T-029 | igual |

## Test Co-location Validation

| Tarefa | Matriz exige | Tarefa entrega | Condição |
| --- | --- | --- | --- |
| T-000 | unit | unit | mesma entrega; 6 cenários mínimos |
| T-001 | unit | unit | mesma entrega; 5 cenários mínimos |
| T-002 | integration | integration | mesma entrega; 5 cenários mínimos |
| T-003 | integration | integration | mesma entrega; 8 cenários mínimos |
| T-004 | integration | integration | mesma entrega; 5 cenários mínimos |
| T-005 | integration | integration | mesma entrega; 6 cenários mínimos |
| T-006 | integration | integration | mesma entrega; 3 cenários mínimos |
| T-007 | integration | integration | mesma entrega; 4 cenários mínimos |
| T-008 | unit + browser | unit + browser | mesma entrega; 4 cenários mínimos |
| T-009 | e2e | e2e | mesma entrega; 6 cenários mínimos |
| T-010 | unit + integration | unit + integration | mesma entrega; 6 cenários mínimos |
| T-011 | integration | integration | mesma entrega; 7 cenários mínimos |
| T-012 | unit | unit | mesma entrega; 4 cenários mínimos |
| T-013 | integration | integration | mesma entrega; 5 cenários mínimos |
| T-014 | unit + integration | unit + integration | mesma entrega; 6 cenários mínimos |
| T-031 | e2e | e2e | mesma entrega; rotas/marca e jornadas anteriores |
| T-015 | integration | integration | mesma entrega; 6 cenários mínimos |
| T-016 | integration | integration | mesma entrega; 9 cenários mínimos |
| T-017 | integration | integration | mesma entrega; 6 cenários mínimos |
| T-018 | e2e | e2e | mesma entrega; 6 cenários mínimos |
| T-019 | integration + e2e | integration + e2e | mesma entrega; 4 cenários mínimos |
| T-020 | unit + workflow | unit + workflow | mesma entrega; 5 cenários mínimos |
| T-021 | container + e2e | container + e2e | mesma entrega; 6 cenários mínimos |
| T-022 | container | container | mesma entrega; 5 cenários mínimos |
| T-023 | integration + container | integration + container | mesma entrega; 5 cenários mínimos |
| T-024 | unit | unit | mesma entrega; 6 cenários mínimos |
| T-025 | integration | integration | mesma entrega; 9 cenários mínimos |
| T-026 | provider + e2e | provider + e2e | mesma entrega; 4 cenários mínimos |
| T-027 | documental + jornada | documental + jornada | mesma entrega; 2 cenários mínimos |
| T-028 | integration | integration | mesma entrega; 4 cenários mínimos |
| T-029 | aceite humano + discriminação | aceite humano + discriminação | mesma entrega; 2 cenários mínimos |
| T-030 | integration + e2e | integration + e2e | mesma entrega; 6 cenários mínimos |

## Delegação e integração

- Pesquisas e revisão de segurança são somente leitura por padrão.
- T-003/T-004/T-006 podem ser divididas após T-002 se ownership de root/env for
  reservado ao principal. Não editar o mesmo manifest/lockfile simultaneamente.
- UI é uma frente própria; a integração do frontend depende dela.
- Na fase auth, T-017 e T-018 podem ser paralelas depois do contrato T-016.
- O principal resolve decisões, revisa diferenças e integra configuração global.
- Após implementação, revisor em contexto fresco reconstrói requisitos e provas.
  Falhas controladas em scratch devem ser detectadas pelos gates; sobreviventes
  reabrem trabalho. Nunca usar produção ou stash para esse ensaio.
- A release só é chamada pronta quando seus gates reais passam. S0, piloto
  remoto e humano pendentes permanecem explicitamente pendentes.

## Validation Log

- Planejamento anterior: pesquisa e validação documental em [review.md](review.md).
- T-000–T-010 concluídos no incremento local. Relatório independente e matriz
  de critérios/assertions em [local-validation.md](local-validation.md).
- `pnpm check:full` independente: build/lint/types verdes e **141 testes**:
  37 harness, 31 unit/property, 15 UI, 46 integração real e 12 E2E.
  Nenhuma falha ou skip. Os 38 testes anteriores foram preservados.
- Sensor em cópias temporárias: 3/3 falhas controladas detectadas (checksum,
  CSRF e evidência do harness); árvore original preservada.
- Lifecycle corrigido após órfãos no teardown: SIGTERM/SIGINT, falha de wrapper
  e processo resistente passaram em quatro cenários, preservando outro projeto.
- Backend compilado também passou smoke com DB local real: health/ready 200,
  três registros públicos, SIGTERM exit 0 e porta liberada.
- `pnpm install --frozen-lockfile` passou. React Doctor: zero erros, 12 avisos
  no pacote UI documentados em [tech-debt.md](../../plans/tech-debt.md).
- Configuração local Blacksmith: cinco testes do workflow/agregador. T-020 segue
  parcial; nenhum run remoto, instalação do App ou branch protection foi executado.
- Não verificado nesta entrega: auth, geração dos dois perfis, CI remoto, containers
  de aplicação, provisionamento/publicação Railway, restauração ou aceite humano.


### Configurador, diagnóstico e referência — incremento validado

- T-011/T-012: 15 integrações do gerador e 8 testes de perguntas; PTY real com
  três escolhas, cancelamento e recusa de opções futuras. Interrupções SIGKILL
  entre publicações retomam sem sobrescrever configuração diferente.
- T-013: 8 integrações de setup, incluindo Postgres real com dado preservado após
  falha após a migração; 12 cenários de recuperação da preparação de credenciais.
- Gate Integration + Quick: 80 integração, 37 harness, 39 loop e 15 UI, todos verdes.
- T-031: 14 E2E direcionados, build/typecheck/Biome verdes, logo oficial e rotas
  conferidas. React Doctor do frontend: 100/100, nenhum diagnóstico.
- Ensaio do setup interativo em clone limpo com Node/pnpm/Docker reais concluído;
  diagnóstico real passou com serviços ativos e desligados. Não é aceite humano.
- T-014: 10 unitários e 6 integrações; Fastify/proxy reais, consultas read-only,
  arquivos/permissões/mtime preservados e CLI chamada por alias de diretório.
- Smoke real encontrou e corrigiu rota presumida do proxy e guard CLI que não
  canonicalizava o caminho. Regressões acrescentadas antes do gate final.
- Gate Full independente final: **204/204**, sem falha/skip: 37 harness, 49
  unit/property, 15 UI, 87 integração e 16 E2E. **3/3 mutantes detectados** em
  cópia descartável, com arquivos e ambiente real preservados.
- [Relatório independente](onboarding-validation.md), com assertions por critério,
  correções e limites. Auth, CI remoto, Railway e aceite humano continuam futuros.

### Ajuste posterior de T-031 — guia na página inicial

- Usuário autorizou um guia substituível em `/`, no lugar da raiz vazia.
  REQ-041, design e instruções agora refletem essa decisão.
- Quick, build do frontend e **16/16 E2E** passaram após o ajuste. O teste
  `orienta o inicio do produto sem consultar API ou carregar referencia` verifica
  os três passos, link real para a referência, ajuda por teclado e ausência de
  API/catálogo. Screenshots de 1440 e 390 px inspecionadas, sem overflow.
- React Doctor: **100/100**, sem diagnósticos; revisão independente somente leitura
  sem achados concretos. Integração completa não repetida neste ajuste de UI;
  o relatório de 204 testes acima registra o estado anterior ao guia.
