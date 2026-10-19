# Arquitetura

Monorepo pnpm com aplicações independentes e pacotes locais. Cada clone tem
código, banco e identidade próprios; não usa o banco nem o runtime do renova-monorepo.

```text
Browser → Vite /api (proxy local) → Fastify/tRPC → Postgres
apps/frontend → packages/ui
apps/frontend → import type de @renova/backend/contract
apps/backend → packages/db-types + packages/dbmigrator (readiness)
scripts/db → packages/dbmigrator → Postgres (papel de migração)
```

Frontend e API compartilham origem no navegador. O backend não é importado em
runtime pelo browser. O harness descobre os nomes nos manifests: renomear scopes
não permite que `packages/*` importe `apps/*`, nem que o frontend importe DB/Node
ou implementação do backend.

| Pasta | Responsabilidade |
| --- | --- |
| `apps/frontend` | React/Vite; produto em `/`, catálogo e exemplo público em `/referência` |
| `apps/backend/src/env.ts` | Validação central de configuração antes de listen |
| `apps/backend/src/server` | HTTP, políticas obrigatórias, limites e erros sanitizados |
| `apps/backend/src/modules/example` | Consulta pública paginada, sem writer |
| `packages/ui` | Componentes, tokens, fontes e origem registrados em NOTICE |
| `packages/db-types` | Contrato tipado do schema |
| `packages/dbmigrator` | Histórico/checksum, transação, lock e readiness sem escrita |
| `scripts/db` | Identidade e alvos locais/teste, Compose e credenciais separadas |
| `scripts/project` | Manifesto, plano, setup retomável, diagnóstico readonly e execução local |
| `scripts/harness` | Regras objetivas; produto em harness.rules.mjs |

## Produto e biblioteca de referência

`HomePage.tsx` pertence ao produto e começa com um guia substituível. `ReferencePage.tsx` e
`reference/ReferenceGallery.tsx` são exemplos em `/referência` (alias `/referencia`),
carregados sob demanda. A página inicial não consulta a API demonstrativa. A logo
oficial acompanha o clone, sem dependência do monorepo original em execução.

O setup configura identidade e prepara o ambiente; não sobrescreve os workspaces.
O diagnóstico somente observa. O plano `--plan` não instala nem inicia recursos.
Todos usam o mesmo manifesto validado; login/Railway não ficam parcialmente ativados.

## Fronteiras de segurança

O perfil entregue é público e somente leitura: três exemplos sintéticos, nenhuma
rota/tabela de identidade e nenhuma operação de escrita anônima. Autenticação
ainda não está instalada; registrar política privada falha.

O processo da API usa credencial limitada a leitura; o migrador usa papel separado.
Migrations recusam alvos remotos, identidade divergente e histórico alterado.
Readiness verifica conexão e integridade do histórico de migrations; retorna 503
se estiver indisponível, pendente ou divergente. Não exige tabelas de demonstração.
Schema de produto tem testes próprios; health
indica apenas que o processo responde. Migração não acontece ao iniciar a API.

Segredos ficam no ambiente do servidor. O frontend recebe apenas nome de projeto
público; não recebe DATABASE_URL. Erros públicos são genéricos e têm request ID.
Produção requer configuração própria; Docker de aplicação, proxy de produção,
sessões, deploy e verificação Railway são etapas futuras.
