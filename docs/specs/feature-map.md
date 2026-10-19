# Feature map

Ponto de vista do usuário. Skill [verify-app](../../.agents/skills/verify-app/SKILL.md)
percorre estas jornadas; Playwright usa os mesmos nomes acessíveis e seletores.

## Base Renova

Prepare com `pnpm run setup`; `pnpm dev` mostra o endereço local.
O perfil atual é público, somente leitura.

| Jornada | Como chegar | Seletores / nomes | Oráculo | Pegadinha |
| --- | --- | --- | --- | --- |
| Começar o produto | `/` | `product-home` | Guia de três passos, link para referência e ajuda acessível por teclado, sem API ou chunk da galeria | Substituir o guia em HomePage.tsx pelo produto |
| Abrir a referência | `/referência` ou `/referencia` diretamente e após refresh | logo Renova Consulting Group | Mesma galeria, logo local oficial, Unicode normalizado | Caminho codificado também funciona |
| Rota inexistente | `/pagina-inexistente` | Página não encontrada | 404 visual com links para produto e referência | Status HTTP de publicação depende da futura configuração Railway |
| Consultar exemplos | `/referência` → Visão geral | `api-status`, `public-record` | API conectada e 3 registros sintéticos do DB real | Não confundir loading com lista vazia |
| Recuperar falha | Visão geral → erro → Tentar novamente | `records-error`, botão Tentar novamente | Alerta some e dados reaparecem após conexão voltar | Interceptação do E2E prova estado de UI; indisponibilidade do DB tem integração própria |
| Lista vazia | Visão geral sem resultados | `records-empty` | Mensagem sem erro nem dados inventados | Cenário de UI simulado explicitamente |
| Explorar componentes | Componentes / Explorar componentes | `component-gallery`, tabs | Fontes locais e controles instalados funcionam | Exemplos interativos não salvam dados |
| Usar teclado | Foco Visão geral → seta → Componentes | tabs, Selecionar exemplo, Exibição compacta | Seleção/foco e Space funcionam | Manter foco visível |
| Abrir e fechar painel | Galeria → Abrir painel → Esc | dialog, Fechar painel | Foco contido e restaurado no acionador | Testar também em 390 px |
| Celular | Viewport 390 px | visão geral e galeria | Sem scroll horizontal; controles e painel utilizáveis | Inspeção visual além de medida de largura |

Sem login/cadastro, edição ou exclusão de dados nesta entrega. Dados privados e
escrita dependem de features com política explícita.
