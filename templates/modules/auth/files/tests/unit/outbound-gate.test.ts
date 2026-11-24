import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOutboundGate,
  DEFAULT_OUTBOUND_BATCH_LIMIT,
  OutboundBlockedError,
  type OutboundLogEntry,
  type OutboundSettings,
} from '../../packages/auth/src/outbound.js';

interface Message {
  to: string;
  subject: string;
}

function gate(settings: OutboundSettings & Record<string, unknown> = {}, batchLimit?: number) {
  const deliver = vi.fn(async (_message: Message) => {});
  const logged: OutboundLogEntry[] = [];
  const outbound = createOutboundGate('email', settings, deliver, {
    log: (entry) => logged.push(entry),
    ...(batchLimit ? { batchLimit } : {}),
  });
  return { outbound, deliver, logged };
}
const message = (to: string): Message => ({ to, subject: 'Aviso' });

describe('portão de envio externo', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('por padrão bloqueia destinatário real, registra mascarado e não chama o transporte', async () => {
    const { outbound, deliver, logged } = gate();
    const error = await outbound.send(message('Cliente.Real@Empresa.com.br')).catch((e) => e);
    expect(error).toBeInstanceOf(OutboundBlockedError);
    expect(error.reason).toBe('recipient_not_allowed');
    expect(deliver).not.toHaveBeenCalled();
    expect(logged).toEqual([
      {
        event: 'outbound_blocked',
        channel: 'email',
        reason: 'recipient_not_allowed',
        recipient: 'c***@empresa.com.br',
      },
    ]);
    expect(JSON.stringify(logged)).not.toContain('cliente.real');
  });

  it('NODE_ENV, nome de ambiente ou hostname não liberam envio', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', 'production');
    vi.stubEnv('HOSTNAME', 'app.producao.example.com');
    const { outbound, deliver } = gate({
      NODE_ENV: 'production',
      DEPLOY_TARGET: 'railway',
      RAILWAY_ENVIRONMENT_NAME: 'production',
    });
    await expect(outbound.send(message('cliente@empresa.com.br'))).rejects.toBeInstanceOf(
      OutboundBlockedError,
    );
    expect(deliver).not.toHaveBeenCalled();
  });

  it('domínios reservados (RFC 2606) passam sem lista, pois nunca chegam a uma pessoa', async () => {
    const { outbound, deliver } = gate();
    for (const to of ['pessoa@example.test', 'a@b.example', 'x@host.invalid', 'y@app.localhost'])
      await outbound.send(message(to));
    expect(deliver).toHaveBeenCalledTimes(4);
  });

  it('libera endereço exato e domínio inteiro da lista, sem diferenciar maiúsculas', async () => {
    const { outbound, deliver } = gate({
      OUTBOUND_ALLOWED_RECIPIENTS: ' Equipe@Renova.com.br , @interno.example.org ',
    });
    await outbound.send(message('equipe@renova.com.br'));
    await outbound.send(message('QA@Interno.Example.org'));
    expect(deliver).toHaveBeenCalledTimes(2);
    for (const to of [
      'outra@renova.com.br',
      'qa@sub.interno.example.org',
      'qa@interno.example.org.evil.com',
    ])
      await expect(outbound.send(message(to))).rejects.toBeInstanceOf(OutboundBlockedError);
    expect(deliver).toHaveBeenCalledTimes(2);
  });

  it('não deixa endereço liberado carregar outros destinatários', async () => {
    const { outbound, deliver } = gate({ OUTBOUND_ALLOWED_RECIPIENTS: '@renova.com.br' });
    for (const to of [
      'cliente@gmail.com, equipe@renova.com.br',
      'equipe@renova.com.br;cliente@gmail.com',
      'Cliente <cliente@gmail.com>, equipe@renova.com.br',
      '"cliente@gmail.com" equipe@renova.com.br',
      'cliente@gmail.com\nequipe@renova.com.br',
      '',
    ])
      await expect(outbound.send(message(to))).rejects.toBeInstanceOf(OutboundBlockedError);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('somente a chave manual exata libera qualquer destinatário e isso fica registrado', async () => {
    for (const value of ['false', undefined]) {
      const { outbound, deliver } = gate({
        OUTBOUND_SEND_TO_ANY: value as OutboundSettings['OUTBOUND_SEND_TO_ANY'],
      });
      await expect(outbound.send(message('cliente@gmail.com'))).rejects.toBeInstanceOf(
        OutboundBlockedError,
      );
      expect(deliver).not.toHaveBeenCalled();
    }
    for (const value of ['TRUE', '1', 'yes', ' true']) {
      const { outbound } = gate({ OUTBOUND_SEND_TO_ANY: value as 'true' });
      await expect(outbound.send(message('cliente@gmail.com'))).rejects.toBeInstanceOf(
        OutboundBlockedError,
      );
    }
    const { outbound, deliver, logged } = gate({ OUTBOUND_SEND_TO_ANY: 'true' });
    expect(logged).toEqual([{ event: 'outbound_unrestricted', channel: 'email' }]);
    await outbound.send(message('cliente@gmail.com'));
    expect(deliver).toHaveBeenCalledOnce();
  });

  it('recusa lote acima do limite inteiro, antes de qualquer envio, e registra', async () => {
    expect(DEFAULT_OUTBOUND_BATCH_LIMIT).toBe(20);
    const { outbound, deliver, logged } = gate({ OUTBOUND_SEND_TO_ANY: 'true' });
    const batch = Array.from({ length: 21 }, (_, index) => message(`p${index}@example.test`));
    const error = await outbound.sendBatch(batch).catch((e) => e);
    expect(error).toBeInstanceOf(OutboundBlockedError);
    expect(error.reason).toBe('batch_limit');
    expect(deliver).not.toHaveBeenCalled();
    expect(logged).toContainEqual({
      event: 'outbound_batch_refused',
      channel: 'email',
      size: 21,
      limit: 20,
    });
  });

  it('dentro do limite confere cada destinatário e isola falhas do transporte', async () => {
    const { outbound, deliver, logged } = gate(
      { OUTBOUND_ALLOWED_RECIPIENTS: 'equipe@renova.com.br' },
      3,
    );
    deliver.mockRejectedValueOnce(new Error('SENTINEL_PROVIDER'));
    const results = await outbound.sendBatch([
      message('equipe@renova.com.br'),
      message('cliente@gmail.com'),
      message('pessoa@example.test'),
    ]);
    expect(results).toEqual(['failed', 'blocked', 'accepted']);
    expect(deliver).toHaveBeenCalledTimes(2);
    expect(logged.filter((entry) => entry.event === 'outbound_blocked')).toHaveLength(1);
    await expect(
      outbound.sendBatch(Array.from({ length: 4 }, () => message('equipe@renova.com.br'))),
    ).rejects.toBeInstanceOf(OutboundBlockedError);
  });

  it('configuração inválida falha na criação do portão', () => {
    expect(() => gate({ OUTBOUND_ALLOWED_RECIPIENTS: 'equipe@renova.com.br, qualquer' })).toThrow(
      'Invalid outbound allowlist entry.',
    );
    expect(() => gate({ OUTBOUND_ALLOWED_RECIPIENTS: '@' })).toThrow();
    expect(() =>
      createOutboundGate('email', {}, async () => {}, { batchLimit: 0, log: () => {} }),
    ).toThrow('Invalid outbound batch limit.');
  });
});
