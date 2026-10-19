# Revisão de PR

Humano (ou revisor em contexto fresco) revisa **evidência**. Autor ≠ revisor.

1. Título cita `{{LINEAR_TEAM_KEY}}-NN`.
2. Template preenchido — camadas distintas.
3. `tasks.md`: `done` tem `it` verdadeiro (`harness:check`).
4. Frente **Testes provam?**: distinguiria implementação errada?
5. Frente **Tela**: `verify-app` / E2E, ou o log diz que **não** conferiu.
6. Frente **Harness**: não desliga regra, não sobe timeout no escuro.
7. CODEOWNERS em `AGENTS.md`, `scripts/`, `docs/process/`, `harness.rules.mjs`.

Não mergear com “integração fica com o CI”. Não aceitar screenshot no lugar do teste dono. Não retryar flake — isole o teste.
