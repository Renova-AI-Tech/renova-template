# Integração

Testes de Postgres, HTTP e preparação local ficam em `*.test.ts` nesta pasta.
Execute `pnpm test:integration`; o comando prepara bancos descartáveis e nunca
usa o banco de desenvolvimento. Não execute testes contra credenciais reais.

`pnpm check:full` e o job `required` executam integração em PR de código. Acrescente o
teste da sua feature nesta pasta, junto da implementação; não crie suíte paralela.
