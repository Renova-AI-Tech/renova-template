# DESIGN: base independente de projetos Renova

Spec: [requirements.md](requirements.md). Contexto: [context.md](context.md).
Estado: plano aprovado; T-000–T-014 e T-031 implementados e validados localmente.
As seções descrevem a arquitetura completa pretendida. Configuração guiada e
diagnóstico compõem o incremento atual; autenticação, containers de aplicação e Railway continuam futuros. A base local
já tem Vite/Fastify/Postgres/UI; o exemplo anterior foi retirado por autorização do usuário.

No incremento local, `packages/db-types` tem tipos explícitos confrontados com o
schema real nos testes; codegen não foi introduzido. O estado do banco fica em
`.renova/db-state.json` e os helpers em `scripts/db/`. Configuração TypeScript
compartilhada continua no `tsconfig.base.json`, sem novo pacote apenas para isso.

## Architecture Overview

Recomendação: template GitHub com base executável e receitas de capacidades.
O configurador materializa código no projeto; não instala um sistema de plugins
dinâmicos na aplicação. Cada projeto funciona sem serviço central Renova.
As alternativas e suas razões estão na [pesquisa](research.md).

```mermaid
flowchart LR
  U[Humano ou IA] --> C[Configuração validada]
  C --> P[Plano de arquivos e capacidades]
  P --> R[Repositório independente]
  R --> L[Local: Vite e Fastify + Postgres Docker]
  R --> G[GitHub Actions: Blacksmith]
  G --> D[Publicação aprovada]
  D --> W[Railway: frontend + backend + Postgres]
```

## Fronteira de composição

| Camada | Sempre presente | Selecionável na v1 |
| --- | --- | --- |
| Aplicação | Vite/React, Fastify/tRPC, Postgres/Kysely, contratos TypeScript | Perfil sem login ou com login |
| Visual | `packages/ui`, fontes, tokens, catálogo e shell | Nome do projeto; identidade Renova permanece |
| Segurança | Validação, autorização declarada, limites, logs sanitizados, proteção de configuração | Nenhuma opção para desligar o núcleo |
| Desenvolvimento | Setup, doctor, testes, harness e instruções no clone | Execução guiada ou manifesto/JSON para IA |
| Entrega | Arquivos de CI e contratos de container | Conectar GitHub/Railway quando necessário |
| Executor CI | Blacksmith em organização GitHub autorizada | Habilitação por repositório; sem fallback automático |
| Identidade | Nenhuma identidade compartilhada entre projetos | Módulo auth completo; email é dependência desse módulo |

Sem login é um perfil suportado. Não existe `AUTH_ENABLED=false` que converte
handlers protegidos em públicos. A política de acesso é registrada junto à rota.

## Estrutura proposta

```text
apps/frontend/                  Vite, rotas, providers e cliente tRPC
apps/backend/                   Fastify, env, políticas e módulos de aplicação
packages/ui/                    componentes, fontes e tokens Renova
packages/dbmigrator/             runner e migrations próprias
packages/db-types/               tipos do schema
packages/typescript-config/      configuração compartilhada
packages/auth/                  somente no perfil com login
templates/modules/auth/         receita de instalação, não carregada em runtime
scripts/project/                configuração, planos, geração e diagnóstico
scripts/deploy/                 plano, aplicação e verificação Railway
renova.project.json             identidade e capacidades, sem segredos
.renova/state.json              estado local ignorado, sanitizado
docker-compose.yml             Postgres; caixa de email apenas com auth
Dockerfile.frontend              build raiz e Caddy
Dockerfile.backend               backend compilado e runner de migration
railway.frontend.json            configuração declarativa do serviço
railway.backend.json             configuração declarativa do serviço
```

Node 24 e pnpm com versão exata no `packageManager`. Manter workspaces e scripts
simples; Turbo só entra se a execução dos workspaces justificar, sem ser requisito
de produto. O contrato tRPC continua exportado como tipos do backend; frontend
não importa implementação, conexão de DB ou segredos do servidor.

Bootstrap do configurador usa módulos nativos de Node antes de instalar dependências.
Receitas ficam fora dos workspaces runtime. Cada perfil usa um lockfile gerado e
validado na release do template; setup não resolve versões `latest` por conta própria.
Atualizações de dependências recompõem e validam os dois perfis.

## Experiência de criação

1. Criar repositório pelo template ou obter uma cópia local sem publicar.
2. `pnpm run setup` verifica pré-requisitos e pede o nome. Enquanto só sem login/local
   estiver disponível, informa essa configuração no resumo; não oferece escolhas indisponíveis.
3. Mostrar resumo de arquivos/capacidades. Aplicar somente após aceite local.
4. Preparar DB e, se necessário, caixa de email local. Aplicar migrations.
5. `pnpm dev` mostra URL local e estado dos serviços. `pnpm run doctor` explica falhas.
6. Para Railway, `pnpm deploy:prepare` gera plano. A etapa separada de apply
   solicita destino e autorização explícitos, nunca inferidos do login no CLI.

GitHub/Railway ausentes não bloqueiam local. Ferramenta de tarefas é opcional
também para PRs; objetivo e critérios ficam no pedido/spec local. Instalação de Docker/Node
é pré-requisito explicado; setup não promete instalar software de sistema com
privilégios. macOS, Linux e WSL2 são a matriz inicial. Um devcontainer pode ser
avaliado depois do piloto se os pré-requisitos forem o principal obstáculo.

Setup e doctor são implementados neste incremento. Os comandos de módulos e deploy continuam futuros. Use `run`: `setup` e `doctor` também são comandos internos do pnpm.

| Comando | Efeito | Não faz |
| --- | --- | --- |
| `pnpm run setup -- --config renova.project.json --plan` | Valida e apresenta plano local | Não escreve arquivos nem inicia containers |
| `pnpm run setup -- --config caminho.json --yes` | Aplica configuração local já fornecida | Não concede publicação, custo ou acesso remoto |
| `pnpm run doctor -- --json` | Diagnóstico seguro para IA/CI | Não altera configuração nem imprime ambiente completo |
| `pnpm module:add -- auth --plan` | Planeja evolução de projeto existente | Não muda automaticamente ownership ou permissões |
| `pnpm deploy:prepare -- --target railway` | Consulta autorização/destino e calcula plano | Não cria, altera nem publica |
| `pnpm deploy:apply -- --plan-id ID` | Aplica plano atual explicitamente aprovado | Não usa projeto selecionado implicitamente no CLI |

Sem TTY, `--config` é obrigatório, inclusive para `--plan`; aplicar exige `--yes`. Ausência de escolhas obrigatórias termina com código 2; não aguarda
entrada para sempre. JSON tem versão de schema, `status` e `nextActions`; doctor contém `checks`, setup contém `steps` e plano contém `files`; segredos nunca integram sua saída. Não interpretar uma string do
manifesto como comando shell: argumentos estruturados e catálogo local confiável.

## Modelo de configuração e estado

Formato declarativo lido pelo configurador. Parta do `renova.project.json` do clone e preserve sua origem:

```json
{
  "schemaVersion": 1,
  "project": { "slug": "meu-projeto", "displayName": "Meu projeto" },
  "profile": "public",
  "capabilities": [],
  "initialTarget": "local",
  "origin": { "templateVersion": "0.1.0-dev", "sourceRevision": "d0c2db9", "uiVersion": "0.1.0-dev" }
}
```

`profile` aceita `public` ou `authenticated`. O segundo implica capacidade
`auth`; inconsistência é erro, não uma configuração parcialmente funcional.
Slug: 3–48 caracteres ASCII, `[a-z][a-z0-9]*(?:-[a-z0-9]+)*`, sem nomes reservados
de sistema. Nome de exibição: 1–80 caracteres, tratado como texto, nunca HTML.
Paths de saída são resolvidos sob a raiz autorizada e symlinks de escape recusados.

`initialTarget` não determina autorização runtime. Configuração por ambiente fica
em env validado. IDs reais da instalação Railway são registrados após vinculação;
não entram como defaults no template de origem. Tokens e senhas ficam em `.env`
local ignorado ou no cofre do provedor. Nenhum `.env` criptografado do Renova atual
é copiado. O manifesto não contém credenciais nem estado pessoal.

Estado de setup: `planned → applying → ready` ou `failed`. Cada etapa registra
seu resultado verificável. Reexecução confere recurso e versão antes de reutilizar.
Geração trabalha em diretório temporário, valida resultado e aplica diff; conflito
em arquivo alterado pelo usuário falha antes de substituir. Falha de DB preserva
volume; não existe limpeza automática do banco como compensação.

O clone já contém os workspaces públicos completos. O gerador configura sua identidade
em `renova.project.json` e registra hashes em `.renova/project-state.json`; não recopia
nem substitui código do produto ou altera o lockfile. Se o manifesto atual já é
exatamente a configuração solicitada, pode reconciliar apenas o registro de hash.
Após criar ambiente local, o slug fica fixo para preservar a identidade do banco.
Nesta etapa somente `public` + `local` é aplicável; o menu identifica login e Railway
como etapas futuras e recusa essas escolhas antes de escrever.

A preparação local registra passos sanitizados em `.renova/setup-state.json`, confere
pré-requisitos, instala o lockfile, prepara credenciais, sobe Postgres e migra o schema.
A repetição verifica todos os passos idempotentes; um checkpoint verde não dispensa
conferir o recurso atual. Credenciais em publicação interrompida ficam sob `.renova`
ignorada e permissão 0600, com journal e hash; só o estágio reconhecido pode retomar.

Doctor é somente leitura e valida o DB vinculado, sem compilar ou instalar nada.
Seu código 0 significa ambiente local pronto; ambos os serviços desligados com
portas livres são válidos, com `pnpm dev` como próxima ação. Serviços ativos exigem
health/readiness, proxy e HTML válidos; execução parcial ou portas de outro serviço
retornam código 1. Configuração inválida retorna 2. CI/provedor são explicitamente
não verificados por esse diagnóstico local.

A página `/` é reservada ao produto (`HomePage.tsx`), inicialmente com um guia substituível de primeiros passos e sem chamada
à API. O guia orienta a consulta à referência, a descrição da ideia para a IA e
a substituição da HomePage pelo produto; comandos de ambiente ficam em ajuda recolhida. `/referência`, com alias `/referencia`, carrega os exemplos sob demanda e
usa a logo oficial local com origem registrada. Features novas pertencem às páginas
do produto, reutilizando componentes da referência e de `@renova/ui`.

## Components

| Componente | Interface planejada | Dependências / responsabilidade |
| --- | --- | --- |
| Configurador | `parseProjectConfig(input)` | Schema fechado e compatibilidade; sem I/O |
| Planejador | `planProject(root, config)` | Lista arquivos, conflitos e passos; não executa |
| Aplicador local | `applyProject(plan)` | Verifica hashes, aplica identidade e preserva WIP |
| Setup | `runSetup(root, config)` | Etapas retomáveis, conexão local, migrations |
| Doctor | `diagnose(target)` | Estado sanitizado, causa e ação; não corrige escondido |
| Política API | `registerOperation({access, handler})` | Política obrigatória e default deny |
| Auth opcional | `getSession(request)`, handler da biblioteca | Identidade sem regras BPO/empresa |
| Deploy | `planDeployment`, `applyDeployment`, `verifyDeployment` | Destino explícito, plano/hash, retomada e provas separadas |

Não criar abstração para vários provedores de auth ou deploy na primeira versão.
Uma fronteira pequena atende o caso real; nova implementação exige demanda e teste.

## Perfis e dados

### Sem login

Página inicial, catálogo e exemplo de leitura no Postgres de registros sintéticos
declarados públicos. Sem mutation de negócio, conta, sessão ou fixture privada.
Mesmo comportamento local e cloud. Pessoas podem desenvolver escrita pública,
mas isso é uma nova feature com limites, retenção e revisão específicos.

### Com login

`packages/auth` contém integração de uma biblioteca mantida. Cadastro público
fechado e liberação pelo responsável estão confirmados. O método proposto é
email/senha. Responsável usa um comando administrativo
delimitado para provisionar conta; o usuário ativa e define senha por link único.
Recuperação não revela se o email existe. Não há senha universal, seed admin remoto,
painel de gestão de usuários ou envio de mensagens de produto na v1.

Email necessário à identidade: caixa local isolada, acessível só em loopback;
um provedor transacional configurado para o ambiente remoto. Produção não inicia
o perfil autenticado com entrega não configurada. Falha de entrega preserva conta
pendente e admite reenvio limitado. O endpoint público de recuperação mantém a
mesma resposta genérica para conta existente/inexistente, inclusive em falha de
envio, sem prometer entrega. O diagnóstico administrativo sanitizado registra
falha ou aceitação do provedor; aceitação não prova recebimento pelo destinatário.

Modelos mínimos: identidade/sessão/token segundo migrations revisadas da biblioteca;
`example_records(id, owner_id, title, created_at, updated_at)` no perfil autenticado.
`title` tem 1–120 caracteres; listagem usa página de até 100 registros. O exemplo
público usa tabela separada de conteúdo sintético sem `owner_id`. Adicionar auth
não assume que registros públicos anteriores pertencem à primeira conta criada.

Spike S0 verifica API da biblioteca, contrato de email, sessão, migrações e
compatibilidade com tRPC. Se o candidato falhar, registrar decisão revisada antes
de implementar; não começar silenciosamente um mecanismo próprio de autenticação.

## Segurança mínima proposta

Valores abaixo são defaults de projeto propostos, não exigências universais OWASP.
Não devem ser apresentados ao iniciante como opções para desativar proteção.

| Risco | Controle | Oráculo de validação |
| --- | --- | --- |
| Operação inadvertidamente pública | Política obrigatória `public`/`authenticated`; proprietário em cada consulta/mutation privada | Rota sem política recusada; usuário B não lê/edita registro de A (404) |
| Login desativado por variável | Composição gera módulo completo ou o omite; rotas privadas sem módulo impedem startup | Perfil inválido falha; nenhum fallback para visitante |
| Roubo/fixação de sessão | Sessão no servidor; cookie HttpOnly, Secure em produção, SameSite=Lax na topologia de mesma origem; sem Domain amplo | Login renova identidade; logout/recuperação invalida; token ausente no localStorage |
| Sessão ilimitada | Expiração absoluta proposta de 8 h; tokens de ativação/recuperação 15 min e uso único | Relógio controlado e replay recusado |
| Senha fraca/abuso | Biblioteca mantida; senha 15–128 caracteres sem truncamento; login com resposta genérica | Limites de tamanho e conta inexistente; hashing validado pela biblioteca |
| CSRF/origem falsa | Recusar Origin presente e divergente em escritas; com cookie, exigir origem exata e prova CSRF. Chamada pública sem Origin continua permitida; isso não autentica clientes nem usa CORS como auth | 403 sem efeito no DB na origem maliciosa; testar tRPC e handler auth |
| XSS/exposição de front | React escapando texto, sem HTML arbitrário; CSP por ambiente testada, nosniff e Referrer-Policy | Payload vira texto; CSP permite apenas recursos previstos |
| Abuso de API | Body máximo 1 MiB, 120 req/min/IP geral; login 5 tentativas/15 min por conta e IP; 429 com Retry-After | 413/429 determinísticos; rate limit de auth persistente entre reinícios |
| Exaustão/SQL | Zod no servidor, queries parametrizadas, paginação até 100; timeout de consulta 5 s | Entrada inválida 400; DB cancela consulta; nenhuma concatenação de entrada em SQL |
| Vazamento em diagnóstico | Logs estruturados com correlationId, sem bodies/headers sensíveis; erro público 5xx genérico | Sentinelas não aparecem em logs, JSON, bundle, imagem ou artefatos |
| Segredos/defaults em produção | Env validado, segredos por projeto, URLs canônicas HTTPS, nenhuma fixture privada | Startup e prepare recusam configuração inválida |
| Uso do DB errado | Alvo local explícito; testes usam banco descartável identificado; runtime separado do migrador | Recusa ocorre antes da escrita; nenhum acesso ao banco real |
| Migration concorrente/incompatível | Lock, histórico com integridade, falha interrompe release; revisão de mudança destrutiva | Duas execuções não aplicam a mesma migration; versão modificada falha |
| Dependência vulnerável | Lockfile, atualização revisada e triagem de alertas; exceção com dono, justificativa e validade | CI detecta fixture de segredo; revisão registra risco de dependência sem supor que audit prova segurança |

Limitação inicial: backend com uma réplica. Limites gerais em memória não são
distribuídos; aumentar réplicas exige store compartilhado e nova validação. Limites
de login não podem ser contornados por reinício. Configurar confiança no proxy
para a topologia efetiva; cliente não deve escolher IP por header arbitrário.
TLS do Postgres é configurado por ambiente; nunca copiar `rejectUnauthorized:false`
sem verificar o contrato do destino. Runtime não deve operar como superusuário.

## Design system

Extrair a revisão Renova registrada na pesquisa, com licença e origem. Remover
nomes de pessoas/cargos, conteúdo BPO e variantes que dependem de CSS externo.
Fontes e tokens pertencem ao pacote; a aplicação somente consome. Galeria demonstra
componentes existentes, estados e composições. Não prometer dark mode completo.
Testar foco/teclado/390 px e fontes efetivamente carregadas; Radix não substitui
essa prova. O catálogo não mostra informações internas, tokens ou dados reais.

## Railway e CI

Frontend Caddy público, proxy `/api` para Fastify privado, Postgres privado e volume
próprio. Build usa raiz do monorepo e inclui dependências compartilhadas nos filtros.
Mesma versão major de Postgres em local, CI e piloto; selecionar e fixar versão
suportada durante a execução, sem reproduzir divergência 15/18 observada na origem.

`prepare` resolve organização/repo/workspace/ambiente com consultas de leitura;
apresenta configurações, recursos, responsáveis e impacto de custo, sem inventar
cotação. Plano sanitizado tem identificador/hash e validade proposta de 30 minutos.
Inclui SHA do commit, hash do contexto de build/lockfile e, se já houver imagem,
seu digest. Publicação usa checkout limpo desse SHA ou o digest aprovado, nunca
o conteúdo mutável da branch nem WIP local. Antes de qualquer publicação, `apply`
consulta sucesso explícito de todos os checks obrigatórios desse SHA; pendente,
cancelado, ignorado, ausente ou falho recusa a ação. Não basta o CI de outro commit.
Alteração de código, artefato ou plano invalida o aceite. O piloto deve provar que
o provedor recebeu a revisão aprovada; caminhos que não a fixem não são habilitados.
Autodeploy fora desse contrato permanece desabilitado até provar gate equivalente.
`apply` exige aceite do plano atual, revalida inventário, cria somente os recursos
ausentes e registra IDs após confirmação. Resultado desconhecido exige consulta
antes de retry. Divergência de destino ou estado exige novo plano. Falha não apaga
recursos com dados nem move produção existente.

Publicação inicial usa domínio gerado Railway; domínio corporativo é etapa
adicional explícita. Nenhuma migração da infraestrutura Renova atual faz parte
do plano. Banco local nunca é copiado implicitamente. Backups e restauração em
destino descartável devem ser ensaiados antes de admitir dados reais.

Pré-deploy do backend aplica migrations compatíveis com release anterior e
aborta em falha; não rodar migration no build ou em toda inicialização de réplica.
`/health` é liveness; `/ready` verifica DB e versão esperada de schema com resposta
sanitizada. Não declarar frontend saudável como prova de fluxo autenticado.
Rollback de imagem não reverte banco; mudança destrutiva precisa plano separado.

GitHub Actions executa os jobs em Blacksmith. Labels iniciais propostas:
`blacksmith-2vcpu-ubuntu-2404` para checks rápidos e
`blacksmith-4vcpu-ubuntu-2404` para integração/E2E/containers; medir no piloto antes
de otimizar. A habilitação exige organização GitHub e acesso do App Blacksmith
ao novo repo; clone não replica esse vínculo e repositório pessoal não é suportado
pelo serviço. `doctor` distingue local pronto de CI corporativo habilitado; acesso
não verificável fica como pendência, nunca como sucesso presumido. Nenhum fallback
silencioso para runners GitHub hospedados. Um projeto pode trabalhar localmente
sem essa habilitação. Admin define acesso, responsável e orçamento do CI.

Usar `actions/setup-node` com cache pnpm e lockfile; os forks
`useblacksmith/setup-node` e `useblacksmith/cache` estão arquivados. Proteção do cache
por branch/tag permanece habilitada. Cada job recebe Postgres descartável via
service container, healthcheck e migrations; cache de imagem não persiste dados.
Playwright instala Chromium compatível e dependências explicitamente, começa com
um worker e publica trace/relatório sanitizados. Medir execução fria e quente.

CI valida imagens com `push: false`. Cache de camadas Blacksmith é opcional e tem
cobrança própria; não acelera automaticamente builds do Railway. Se adotado,
reconfirmar as actions oficiais da documentação especializada (`setup-docker-builder`
e `build-push-action` v2 na consulta), fixar SHAs revisados e chave por workload.
Actions e imagens da cadeia de build têm versões fixadas e atualização revisada.
`GITHUB_TOKEN` somente leitura por padrão; CI de PR não recebe credenciais Railway
nem segredos de produção. Regras de forks/PRs não promovem código não confiável a
jobs privilegiados. Permissões efetivas do App são verificadas na habilitação.

CI dos projetos gerados roda PR e push na branch de publicação. Resultado final
obrigatório verifica que todos os gates aplicáveis terminaram em sucesso. No início,
executar todos os gates de código; otimização por paths só após provar a detecção
de dependências. E2E essencial é bloqueante. Não usar `continue-on-error` em gate
obrigatório. Workflow crítico não deve ser cancelado por um workflow secundário.

Na base mantida pela Renova, CI gera os dois perfis em diretórios descartáveis.
No projeto gerado, CI verifica seu perfil escolhido. Destino cloud não exige
credentials em testes locais; adaptador simulado só prova lógica do plano. Pilotos
Railway comprovam o provedor em etapa autorizada separada. GitHub rulesets e
CODEOWNERS precisam de disponibilidade e configuração reais; se o plano não
suportar enforce, não anunciar proteção obrigatória e não habilitar publicação
autônoma sem um responsável pelo gate de liberação.

## Evolução e manutenção

`module:add auth` primeiro faz inventário de rotas e dados, gera diff e exige
política para registros existentes. Modificações em arquivo customizado geram
conflitos; nenhuma atribuição automática de proprietário ou mudança pública/privada.
Não oferecer `module:remove auth` na v1. Reverter código não autoriza excluir dados.

Versão do template/UI/auth, hashes de arquivos gerados e changelog acompanham o
projeto. Atualização é planejada e revisada por PR; não é conexão runtime com a
plataforma Renova. Definir mantenedor e destinatário de alertas antes da release.
Atualização de dependência externa e atualização de código copiado são fluxos
distintos. Não prometer propagação automática para clones antigos.

## Code Reuse Analysis

| Reuso | Destino | Adaptação |
| --- | --- | --- |
| Motor `scripts/harness` deste repo | Mantido | Descobrir workspaces reais; validar contratos da base |
| Docs/skills deste repo | Mantidos e adaptados | Fluxo autossuficiente, sem instalação de skill pessoal |
| UI do Renova | `packages/ui` | Higienizar defaults, fontes e CSS |
| Transporte tRPC e padrão service/repository | Frontend/backend | Tipos exportados; nenhum domínio BPO |
| Compose e proteção de alvo do DB | Setup/testes | Parametrizar nomes/portas, não congelar máquina do dono |
| Caddy e containers Renova | Deploy | Remover domínios/IDs/segredos específicos |
| Auth/observabilidade Renova | Referência | Não copiar política multiempresa nem inicialização de integrações |

## Risks & Concerns

| Achado | Impacto | Mitigação / tarefa |
| --- | --- | --- |
| `.github/workflows/ci.yml:41` aceita E2E falho | CI verde sem jornada | Gate bloqueante e ensaio de falha, T-020 |
| `scripts/check-full:11-15` e include unit/property | Integração pode não executar | Config explícita e prova de coleta, T-010 |
| `import-direction.mjs:21` fixa nome do sample | Renomear escapa do harness | Mapa de workspaces e testes negativos, T-010 |
| `spec-tests.mjs` só reconhece `it` e escolhe primeiro path | Bloqueia conclusão ou verifica arquivo errado | Corrigir campo/runner antes da primeira tarefa, T-000; evidência humana separada em T-029 |
| UI tem defaults de produto e CSS de app | Clone incompleto e identidade inconsistente | Extração curada, T-008/T-009 |
| Auth atual acoplado a organizações | Excesso de domínio e permissões indevidas | Spike e módulo limitado, T-015/T-016 |
| Remoto/checkout de origem divergem e há WIP | Copiar trabalho não aprovado | SHA de origem explícita, sem tocar checkout |
| Sem dependências instaladas neste clone | Não executar testes de aplicação nesta rodada | Validar docs/harness; instalar e testar só ao implementar |
| Muitas opções futuras | Custo combinatório | Dois perfis; nova capacidade exige matriz própria |
| Plano GitHub/workspace Railway pendentes | Automatização incompleta | Preflight operacional e trava explícita, T-024/T-025 |

## Validation Strategy

Unitário verifica parsers, políticas e planos. Integração usa Postgres descartável
para persistência, migrations e auth. Navegador verifica a jornada real, duas
identidades, logout/recuperação, UI, teclado e responsividade. Containers verificam
proxy, cookies, estáticos e ausência de segredo. Piloto remoto verifica instalação
e publicação em serviços isolados. Piloto humano mede a experiência, separadamente.

Verificador em contexto fresco reconstrói cobertura e aplica falhas controladas
em cópia descartável: remover ownership, aceitar origem indevida, expor secret
sentinela, tornar E2E não bloqueante e apontar teste a DB proibido. Mutante sobrevivente
reabre a tarefa. Não executar esses ensaios no projeto real ou em produção.
