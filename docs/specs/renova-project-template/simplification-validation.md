# Validação da simplificação e entrega

Data: 19/10/2026. Escopo autorizado: configurador, retirada do exemplo anterior,
readiness independente da demonstração, revisão da entrega, PR/merge e clone real.

## Contrato atualizado

- `pnpm run setup` pede nome e confirmação. O resumo informa sem login/local;
  opções ainda indisponíveis não são oferecidas. JSON mantém validação fechada.
- `pnpm dev` sem ambiente orienta setup; falha de pré-requisito orienta doctor.
- Só existem frontend, backend e pacotes Renova. O exemplo financeiro, sua porta,
  specs e testes exclusivos saíram; regras do harness e gates permanecem.
- Readiness valida conexão, versão e checksums das migrations, sem exigir uma
  tabela de demonstração. Schema específico de produto é validado por seus testes.
- As skills do Claude usam symlink real. CODEOWNERS traz somente exemplos comentados.
  Script de CI sem consumidor foi removido. Estado local e segredos ficam fora do Git.

## Evidências

- `pnpm check:full` passou: 37 harness, 36 unit/property, 15 UI, 89 integração e
  14 navegador — **191 testes**, build/lint/types verdes, zero retries/skips.
- A regressão real aplicou uma nova migration que remove a tabela de exemplo;
  readiness continuou verdadeira com o manifesto atualizado e falsa antes da
  aplicação ou com manifesto antigo. Testes de checksum, alvo, papéis e rollback passaram.
- A revisão independente encontrou nomes como “RH” e “99 projetos” gerando slug
  inválido. Corrigido com normalização, limite e prefixo/fallback seguros, usando
  o próprio schema. Configuração/prompts: **28/28** após a correção, incluindo nomes
  reservados, longos e sem transliteração. Identidade existente continua preservada.
- Corrigida também instrução obsoleta na pasta de integração. Inventário confirma
  cinco workspaces (duas apps e três pacotes), sem dependência/porta do exemplo antigo.
  Scan dos arquivos candidatos não encontrou segredo ou estado local elegível para commit.
- Os 17 testes exclusivos do exemplo retirado deixaram a suíte com ele. Dois
  testes de propriedade do manifesto e duas regressões de integração foram adicionados;
  as 14 novas variações de nomes entraram após o primeiro full. Nenhuma proteção foi relaxada.
- CI remoto será conferido na PR para o commit publicado. O clone de outro projeto
  será ensaiado após o merge e terá registro próprio; este relatório não o antecipa.

## Limites

Este é um ensaio de agente, não um piloto de usabilidade com participante leigo.
Autenticação, publicação Railway e experiência nativa Windows não são verificadas.
O GitHub informou que proteção de branch não está disponível no plano atual deste
repositório privado; o merge será condicionado à verificação explícita dos checks.
