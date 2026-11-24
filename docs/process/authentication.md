# Acesso por convite

Este guia descreve o perfil **com login**. O perfil **sem login** continua sem
contas, sessões, tabelas de identidade ou serviço de email.

## Escolher ao começar

Em um clone novo, execute `pnpm run setup`, informe o nome e escolha **com login**.
Confira o resumo antes de confirmar. O setup instala a receita de autenticação,
prepara Postgres e uma caixa de email local. Não é necessário contratar um
serviço de email nem fornecer credenciais corporativas para desenvolver.

Para IA, use `profile: "authenticated"` e `capabilities: ["auth"]` no manifesto
antes do primeiro setup. Preserve `origin`; confira `--plan --json` antes de
aplicar com `--yes --json`. As outras opções do manifesto não mudam.

A escolha é feita antes de personalizar os arquivos que a receita precisa
substituir e antes de preparar o banco. Conflitos são apresentados sem sobrescrita.
Adicionar login a um produto existente exige revisar suas operações e seus dados;
o setup não transforma esse produto automaticamente. Remover login por troca de
perfil também é recusado.

## Liberar uma conta

O responsável pelo projeto executa o comando administrativo de convite no terminal
do próprio projeto. Ele cria uma conta pendente e envia o link para a caixa local;
não existe cadastro público nem senha padrão. A conta só pode entrar depois de
ativar o link e definir uma senha de 15 a 128 caracteres.

```bash
pnpm auth:invite -- pessoa@example.test "Nome da pessoa"
```

O comando funciona somente no banco local vinculado ao projeto. Para reenviar a
uma conta pendente, repita o comando; o limite de tentativas continua valendo.
Contas já ativas usam a recuperação pela tela de entrada.

Os comandos e o endereço da caixa local são apresentados pelo setup/diagnóstico.
Essa caixa captura as mensagens de desenvolvimento: **não entrega email para
destinatários reais**. Não use contas ou senhas de produção nos testes.

Links de ativação e recuperação duram 15 minutos e são de uso único. Se o link
expirar, solicite outro; não altere o banco manualmente. Um envio recusado mantém
a conta pendente e deve ser investigado pelo responsável. Aceitação pela caixa
local não comprova entrega de email externo.

## Usar e desenvolver

- `/entrar`: login, sem opção de cadastro.
- `/ativar`: definição de senha a partir do convite.
- `/recuperar` e `/redefinir-senha`: recuperação por link. A resposta não revela se
  o email existe.
- `/`: produto protegido, começando pelo guia substituível em `HomePage.tsx`.
- `/minha-area`: exemplo de registros privados por proprietário.
- `/referência`: biblioteca pública de componentes e conteúdo sintético.

Sessões expiram em oito horas. Sair revoga a sessão atual; recuperar a senha
revoga as sessões anteriores. A API verifica a identidade e o proprietário em
cada operação privada. Esconder um botão ou proteger somente a tela não concede
proteção à API.

O exemplo público permanece público e somente leitura; instalar auth não
atribui seus registros à primeira pessoa convidada. Novas operações devem
declarar sua política de acesso e filtrar dados pelo usuário autenticado.

## Diagnosticar e publicar

Use `pnpm run doctor` para conferir o banco, o ambiente, os serviços e a caixa
local sem alterar dados. Repita o setup para retomar uma preparação interrompida;
não apague `.env`, `.renova` ou volumes para contornar conflitos.

O perfil autenticado exige configuração explícita de produção: destino Railway,
origem HTTPS, credenciais próprias e Resend. Não possui cadastro público nem
painel de usuários. A operação remota de convite é reservada ao responsável e
exige validar entrega e ativação em cada nova instalação.

## Portão de envio

Todo envio do projeto passa por um portão único
(`packages/auth/src/outbound.ts`) antes de chegar ao Mailpit ou ao Resend,
inclusive um transporte injetado em teste. Por padrão, só saem mensagens para:

- endereços de domínio reservado (`.test`, `.example`, `.invalid`, `.localhost`),
  que nunca chegam a uma pessoa;
- a lista `OUTBOUND_ALLOWED_RECIPIENTS`: endereços exatos ou `@dominio`, separados
  por vírgula (subdomínio não entra).

Qualquer outro destinatário é bloqueado e registrado no log como
`outbound_blocked`, com endereço mascarado. O convite bloqueado não cria conta.
Liberar qualquer endereço exige `OUTBOUND_SEND_TO_ANY=true`, ligado à mão e
somente na produção definitiva; o portão registra `outbound_unrestricted` ao
iniciar. A chave nunca é deduzida de `NODE_ENV`, nome de ambiente, hostname ou
branch: uma homologação com `NODE_ENV=production` continua travada. Fora de
produção a chave é recusada. Em produção, as duas variáveis são obrigatórias.

Envio em lote usa `sendBatch` do portão: lote acima de 20 mensagens é recusado
inteiro antes de qualquer envio (`outbound_batch_refused`). Antes de ligar uma
rotina agendada ou um lote, confira de onde vêm os destinatários e quantos serão.
Um canal novo (SMS, WhatsApp, webhook, cobrança) entrega seu transporte a
`createOutboundGate`; `tests/unit/outbound-paths.test.ts` falha se algum código
chamar provedor ou rede por fora. Dado real copiado para teste chega sem e-mail e
telefone, ou com eles trocados por endereços internos.

## Publicação e email externo

O transporte de produção usa Resend HTTPS; o uso local permanece no Mailpit.
Siga [o guia Railway](railway.md) para destino, chave restrita e convite remoto.
A [validação dos pilotos](../specs/renova-project-template/railway-validation.md) inclui
convite, recuperação recebida e revogação de sessão. Repita a prova no novo destino.
