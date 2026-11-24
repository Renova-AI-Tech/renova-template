import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Guarda estrutural, nos dois perfis: um envio novo (email, SMS, WhatsApp, webhook,
// cobrança) que chame provedor ou rede fora do portão faz este teste falhar. Para um
// canal novo, entregue o transporte a createOutboundGate (packages/auth/src/outbound.ts)
// e registre aqui o arquivo do transporte. O perfil público não tem envio nenhum.
const root = fileURLToPath(new URL('../../', import.meta.url));
const withAuth = existsSync(join(root, 'packages/auth/src/index.ts'));
const scanned = ['apps/backend/src', 'packages', 'scripts'];
const ignoredDirectories = new Set(['node_modules', 'dist', 'coverage']);
const sourceFile = /\.(?:ts|tsx|mts|mjs|js|cjs)$/;

/** Arquivos que podem conter o transporte; nenhum deles decide destinatário. */
const transportFiles = new Set(['packages/auth/src/mail.ts']);

const deliveryPrimitives: readonly [string, RegExp][] = [
  [
    'SDK ou transporte de email',
    /from\s+['"](?:nodemailer|resend|@sendgrid\/[^'"]+|postmark|mailgun[^'"]*|@aws-sdk\/client-sesv?2?)['"]/,
  ],
  ['SDK de SMS/WhatsApp', /from\s+['"](?:twilio|@vonage\/[^'"]+|zenvia[^'"]*|messagebird)['"]/],
  ['SDK de cobrança', /from\s+['"](?:stripe|mercadopago|@pagarme\/[^'"]+|asaas[^'"]*)['"]/],
  ['endpoint de provedor', /https:\/\/api\.(?:resend|sendgrid|twilio|stripe|mercadopago)\.com/],
  ['envio SMTP direto', /\b(?:createTransport|sendMail)\s*\(/],
  ['transporte sem portão', /\bcreateMailTransport\s*\(/],
];
// HTTP a partir do servidor é envio externo (webhook, API de terceiros).
const serverFetch =
  /(?<![\w.])fetch\s*\(|globalThis\.fetch|\bundici\b|from\s+['"](?:axios|got|node-fetch)['"]/;

async function listSources(directory: string): Promise<string[]> {
  const entries = await readdir(join(root, directory), { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...(await listSources(path)));
    } else if (sourceFile.test(entry.name)) files.push(relative(root, join(root, path)));
  }
  return files;
}

describe('todo caminho de envio passa pelo portão', () => {
  it('nenhum código de servidor ou script chama provedor ou rede fora do transporte registrado', async () => {
    const offenders: string[] = [];
    for (const directory of scanned) {
      for (const file of await listSources(directory)) {
        if (transportFiles.has(file)) continue;
        const text = await readFile(join(root, file), 'utf8');
        for (const [label, pattern] of deliveryPrimitives)
          if (
            pattern.test(text) &&
            !(file === 'packages/auth/src/index.ts' && label === 'transporte sem portão')
          )
            offenders.push(`${file}: ${label}`);
        // Operational scripts talk to Railway and the app's own origin, never to recipients.
        if (!file.startsWith('scripts/') && serverFetch.test(text))
          offenders.push(`${file}: HTTP de saída`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it.runIf(withAuth)(
    'o serviço de acesso entrega o transporte, inclusive o injetado, somente ao portão',
    async () => {
      const text = await readFile(join(root, 'packages/auth/src/index.ts'), 'utf8');
      expect(text.match(/\bcreateMailTransport\s*\(/g)).toHaveLength(1);
      expect(text).toMatch(
        /createOutboundGate\(\s*'email',\s*settings,\s*options\.sendMail \?\? mail\.send\b/,
      );
      // The raw transport and the injected one appear nowhere else.
      expect(text.match(/\bmail\.send\b/g)).toHaveLength(1);
      expect(text.match(/\boptions\.sendMail\b/g)).toHaveLength(1);
      expect(text.match(/\boutbound\.send\(/g)?.length).toBeGreaterThan(0);
    },
  );

  it.runIf(withAuth)(
    'o transporte não decide destinatário nem é exportado pelo pacote',
    async () => {
      const mail = await readFile(join(root, 'packages/auth/src/mail.ts'), 'utf8');
      const index = await readFile(join(root, 'packages/auth/src/index.ts'), 'utf8');
      expect(mail).not.toMatch(/OUTBOUND_|allowlist/i);
      expect(index).not.toMatch(/export\s*\{[^}]*createMailTransport/);
      expect(index).not.toMatch(/export\s+\*\s+from\s+['"]\.\/mail/);
    },
  );
});
