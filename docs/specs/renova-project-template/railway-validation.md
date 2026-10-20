# Validação Railway e email — 20/10/2026

Status: em execução; não liberar para dados reais nem afirmar entrega de email
antes de concluir as provas abaixo.

## Destino isolado

- Workspace: Gustavo Priebe's Projects, usado pela Renova.
- Projeto: `renova-template-piloto` (`6a1c95d1-3ae0-4355-8f00-7069f09aabbf`).
- Ambiente: `piloto` (`ee99ba72-d771-4d77-9643-7d497d7b2321`).
- Postgres: `eb38efff-1ae5-49b0-a51f-af5519a34684`, versão 18, banco `renova_piloto`.
- App: `d317139b-5e14-406d-84b5-4207b7abe590`.
- Origem reservada: `https://app-piloto.up.railway.app`.
- Nenhuma alteração em serviços ou dados do projeto Renova existente.

## Evidências por camada

- Testes focais de estáticos/IP/container passaram na frente de implementação.
- Testes focais de migrations, papéis e identidade passaram com Postgres descartável real.
- Resend foi validado com transporte injetado: timeout, redirect, HTTP não aceito,
  recibo inválido e sanitização. Isso não comprova entrega externa.
- O plano IaC nativo foi consultado no piloto sem alterações destrutivas.
- Gates integrados, SHA/CI final, implantação e jornadas: em execução.

## Pendências externas

O Resend conectado retorna `renovagp.com` como não verificado; o DNS atual difere
dessa conta. Nenhum registro existente foi sobrescrito. Falta definir a conta
correta ou verificar um subdomínio separado, configurar chave restrita e confirmar
o destinatário autorizado do ensaio. Convite recebido, ativação e recuperação
remotos ainda não foram comprovados.

Backup/restauração no destino descartável, teste externo de cabeçalhos/IP e aceite
humano permanecem pendentes. Saúde, CI e teste local não substituem essas evidências.
