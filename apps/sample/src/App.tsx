import { type FormEvent, useState } from 'react';
import { previewSplit, type SplitPreview } from './split-preview.ts';

export function App() {
  const [amount, setAmount] = useState('100,00');
  const [parts, setParts] = useState('3');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SplitPreview | null>(() => previewSplit('100,00', 3));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedParts = Number(parts);
    try {
      setPreview(previewSplit(amount, parsedParts));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'falha ao repartir';
      setError(message);
      setPreview(null);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">{'{{PROJECT}}'} · núcleo @project/money</p>
        <h1>Repartir valores</h1>
        <p className="lede">
          Centavos inteiros, resto na última parcela. Esta tela existe para o agente verificar a
          jornada de verdade — não para substituir o pacote puro.
        </p>
      </header>

      <form
        className="panel"
        onSubmit={onSubmit}
        aria-describedby={error ? 'split-error' : undefined}
      >
        <label className="field">
          <span>Valor (R$)</span>
          <input
            data-testid="amount-input"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Parcelas</span>
          <input
            data-testid="parts-input"
            name="parts"
            inputMode="numeric"
            autoComplete="off"
            value={parts}
            onChange={(event) => setParts(event.target.value)}
          />
        </label>
        <button data-testid="split-button" type="submit">
          Repartir
        </button>
      </form>

      {error ? (
        <p data-testid="split-error" id="split-error" className="error" role="alert">
          {error}
        </p>
      ) : null}

      {preview ? (
        <section className="result" aria-live="polite">
          <header className="result-head">
            <h2>Parcelas</h2>
            <p data-testid="total-label">
              Total <strong>{preview.totalLabel}</strong>
            </p>
            <p data-testid="total-cents" hidden>
              {preview.cents}
            </p>
          </header>
          <ol className="rows">
            {preview.rows.map((row) => (
              <li data-testid="installment-row" key={row.index}>
                <span>Parcela {row.index}</span>
                <span data-testid="installment-label">{row.label}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p data-testid="empty-state" className="empty">
          Informe um valor em reais e o número de parcelas.
        </p>
      )}
    </main>
  );
}
