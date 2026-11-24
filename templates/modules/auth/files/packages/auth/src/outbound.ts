/**
 * Portão único de envio externo. Todo envio do projeto (hoje, o email de acesso)
 * passa por aqui antes de chegar a um transporte ou provedor.
 *
 * A decisão usa somente a lista liberada e a chave manual. Nunca deduza a
 * liberação de NODE_ENV, nome de ambiente, hostname ou branch: uma homologação
 * com NODE_ENV=production continua travada até alguém ligar a chave à mão.
 */

export interface OutboundSettings {
  /** Endereços exatos ou `@dominio`, separados por vírgula. */
  OUTBOUND_ALLOWED_RECIPIENTS?: string | undefined;
  /** Somente o texto exato `true` libera qualquer destinatário. */
  OUTBOUND_SEND_TO_ANY?: 'true' | 'false' | undefined;
}

export type OutboundBlockReason = 'recipient_not_allowed' | 'batch_limit';

export type OutboundLogEntry =
  | {
      event: 'outbound_blocked';
      channel: string;
      reason: 'recipient_not_allowed';
      recipient: string;
    }
  | { event: 'outbound_batch_refused'; channel: string; size: number; limit: number }
  | { event: 'outbound_unrestricted'; channel: string };

export class OutboundBlockedError extends Error {
  constructor(readonly reason: OutboundBlockReason) {
    super('Outbound delivery blocked by policy.');
    this.name = 'OutboundBlockedError';
  }
}

export const DEFAULT_OUTBOUND_BATCH_LIMIT = 20;

// RFC 2606: domínios reservados nunca entregam a uma pessoa real.
const reservedDomain = /\.(?:test|example|invalid|localhost)$/;
const address =
  /^[^\s@,;<>"'()[\]\\]+@([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)$/;
const domainEntry = /^@([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)$/;

export function parseAllowedRecipients(value: string | undefined) {
  const addresses = new Set<string>();
  const domains = new Set<string>();
  for (const raw of (value ?? '').split(',')) {
    const entry = raw.trim().toLowerCase();
    if (!entry) continue;
    const domain = domainEntry.exec(entry);
    if (domain?.[1]) domains.add(domain[1]);
    else if (entry.length <= 254 && address.test(entry)) addresses.add(entry);
    else throw new Error('Invalid outbound allowlist entry.');
  }
  return { addresses, domains };
}

/** Mantém o domínio para diagnóstico; o endereço completo não vai para o log. */
export function maskRecipient(recipient: string) {
  const at = recipient.lastIndexOf('@');
  if (at < 1) return '***';
  return `${recipient[0]}***${recipient.slice(at)}`;
}

export function writeOutboundLog(entry: OutboundLogEntry) {
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

export interface OutboundGateOptions {
  batchLimit?: number;
  log?: (entry: OutboundLogEntry) => void;
}

export type OutboundResult = 'accepted' | 'failed' | 'blocked';

export function createOutboundGate<M extends { to: string }>(
  channel: string,
  settings: OutboundSettings,
  deliver: (message: M) => Promise<void>,
  options: OutboundGateOptions = {},
) {
  const { addresses, domains } = parseAllowedRecipients(settings.OUTBOUND_ALLOWED_RECIPIENTS);
  const sendToAny = settings.OUTBOUND_SEND_TO_ANY === 'true';
  const limit = options.batchLimit ?? DEFAULT_OUTBOUND_BATCH_LIMIT;
  const log = options.log ?? writeOutboundLog;
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid outbound batch limit.');
  if (sendToAny) log({ event: 'outbound_unrestricted', channel });

  function allowed(recipient: string) {
    // A single plain address only: lists, display names and comments would let a
    // permitted address carry other recipients past the check.
    const normalized = recipient.trim().toLowerCase();
    const match = normalized.length <= 254 ? address.exec(normalized) : null;
    const domain = match?.[1];
    if (!domain) return false;
    if (reservedDomain.test(domain)) return true;
    return sendToAny || addresses.has(normalized) || domains.has(domain);
  }

  /** Confere o destinatário e registra o bloqueio, sem enviar. */
  function check(recipient: string) {
    if (allowed(recipient)) return true;
    log({
      event: 'outbound_blocked',
      channel,
      reason: 'recipient_not_allowed',
      recipient: maskRecipient(recipient.trim().toLowerCase()),
    });
    return false;
  }

  async function send(message: M) {
    if (!check(message.to)) throw new OutboundBlockedError('recipient_not_allowed');
    await deliver(message);
  }

  /** Lote acima do limite é recusado inteiro, antes de qualquer envio. */
  async function sendBatch(messages: readonly M[]): Promise<OutboundResult[]> {
    if (messages.length > limit) {
      log({ event: 'outbound_batch_refused', channel, size: messages.length, limit });
      throw new OutboundBlockedError('batch_limit');
    }
    const results: OutboundResult[] = [];
    for (const message of messages) {
      if (!check(message.to)) {
        results.push('blocked');
        continue;
      }
      try {
        await deliver(message);
        results.push('accepted');
      } catch {
        results.push('failed');
      }
    }
    return results;
  }

  return { check, send, sendBatch };
}
