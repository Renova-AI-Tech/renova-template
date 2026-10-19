import { z } from 'zod';

const loopbackHosts = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const insecureCredentials = new Set(['postgres', 'password', 'changeme', 'change-me', 'example']);

function parseDatabaseUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) return undefined;
    if (!url.hostname || !url.username || !url.password || url.pathname.length < 2)
      return undefined;
    if (url.search || url.hash || url.hostname.includes('*')) return undefined;
    decodeURIComponent(url.username);
    decodeURIComponent(url.password);
    return url;
  } catch {
    return undefined;
  }
}

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().min(1).default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(43124),
    FRONTEND_URL: z.url().default('http://127.0.0.1:43123'),
    DATABASE_URL: z.string().refine((value) => parseDatabaseUrl(value) !== undefined),
    PROFILE: z.literal('public').default('public'),
  })
  .superRefine((value, ctx) => {
    let frontend: URL;
    try {
      frontend = new URL(value.FRONTEND_URL);
    } catch {
      return;
    }
    if (
      frontend.username ||
      frontend.password ||
      frontend.hostname.includes('*') ||
      frontend.search ||
      frontend.hash ||
      frontend.pathname !== '/' ||
      !['http:', 'https:'].includes(frontend.protocol)
    ) {
      ctx.addIssue({ code: 'custom', path: ['FRONTEND_URL'], message: 'Use a canonical origin.' });
    }
    if (value.NODE_ENV !== 'production' && !loopbackHosts.has(value.HOST)) {
      ctx.addIssue({ code: 'custom', path: ['HOST'], message: 'Use loopback locally.' });
    }
    if (value.NODE_ENV !== 'production' && !loopbackHosts.has(frontend.hostname)) {
      ctx.addIssue({ code: 'custom', path: ['FRONTEND_URL'], message: 'Use loopback locally.' });
    }
    if (value.NODE_ENV === 'production') {
      if (frontend.protocol !== 'https:' || loopbackHosts.has(frontend.hostname)) {
        ctx.addIssue({
          code: 'custom',
          path: ['FRONTEND_URL'],
          message: 'Use a public HTTPS origin.',
        });
      }
      const database = parseDatabaseUrl(value.DATABASE_URL);
      if (
        database &&
        (['postgres', 'root', 'admin'].includes(
          decodeURIComponent(database.username).toLowerCase(),
        ) ||
          insecureCredentials.has(decodeURIComponent(database.password).toLowerCase()) ||
          decodeURIComponent(database.password).length < 24)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['DATABASE_URL'],
          message: 'Use runtime credentials.',
        });
      }
    }
  });

export type BackendEnv = Readonly<z.infer<typeof schema>>;

export function parseEnv(source: Readonly<Record<string, string | undefined>>): BackendEnv {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path[0]))].join(', ');
    throw new Error(`Invalid backend configuration: ${fields}.`);
  }
  return Object.freeze(parsed.data);
}

export function readEnv(): BackendEnv {
  return parseEnv(process.env);
}
