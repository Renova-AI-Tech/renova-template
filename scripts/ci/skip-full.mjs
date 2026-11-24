import { appendFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const docsPrefixes = ['docs/', '.agents/'];
const docsFiles = new Set(['LICENSE', 'LICENSE.txt']);
const generatorPrefixes = [
  'templates/',
  'scripts/project/',
  'scripts/db/',
  'scripts/ci/',
  '.github/workflows/',
];
const generatorFiles = new Set([
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'playwright.config.ts',
  'vitest.loop.config.ts',
  'vitest.integration.config.ts',
  'vitest.harness.config.ts',
  'scripts/check-quick',
  'scripts/check-full',
  'scripts/init.sh',
  '.nvmrc',
  'docker-compose.yml',
  'renova.project.json',
]);
const templateRepository = 'Renova-AI-Tech/renova-template';

function normalizePath(path) {
  const normalized = String(path ?? '')
    .replaceAll('\\', '/')
    .replace(/^\.\//, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.split('/').some((part) => part === '.' || part === '..')
  ) {
    return '';
  }
  return normalized;
}

export function isDocsOnlyPath(path) {
  const normalized = normalizePath(path);
  if (!normalized) return false;
  if (docsFiles.has(normalized)) return true;
  if (docsPrefixes.some((prefix) => normalized.startsWith(prefix))) return true;
  return normalized.endsWith('.md');
}

export function isGeneratorPath(path) {
  const normalized = normalizePath(path);
  if (!normalized) return false;
  if (generatorFiles.has(normalized)) return true;
  return generatorPrefixes.some((prefix) => normalized.startsWith(prefix));
}

export function shouldSkipFull(paths, truncated = false) {
  if (truncated || !Array.isArray(paths) || paths.length === 0) return false;
  return paths.every((path) => typeof path === 'string' && isDocsOnlyPath(path));
}

export function shouldRunProfiles(paths, truncated = false) {
  if (truncated) return true;
  if (!Array.isArray(paths) || paths.length === 0) return false;
  if (paths.every((path) => typeof path === 'string' && isDocsOnlyPath(path))) return false;
  return paths.some((path) => typeof path === 'string' && isGeneratorPath(path));
}

function writeOutput(skipFull, runProfiles) {
  const lines = `skip_full=${skipFull ? 'true' : 'false'}\nrun_profiles=${runProfiles ? 'true' : 'false'}\n`;
  const output = process.env.GITHUB_OUTPUT;
  if (output) appendFileSync(output, lines);
  process.stdout.write(lines);
}

async function changedPullFiles(repository, number, token) {
  const files = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/pulls/${number}/files?per_page=100&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );
    if (!response.ok) throw new Error(`pull files ${response.status}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('pull files');
    for (const file of batch) {
      if (file && typeof file.filename === 'string') files.push(file.filename);
    }
    if (batch.length < 100) return { truncated: false, files };
  }
  return { truncated: true, files };
}

export async function classifyCi(env = process.env) {
  const template = env.GITHUB_REPOSITORY === templateRepository;
  if (env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
    return { skipFull: false, runProfiles: template };
  }
  if (env.GITHUB_EVENT_NAME !== 'pull_request') {
    return { skipFull: false, runProfiles: false };
  }
  const repository = env.GITHUB_REPOSITORY ?? '';
  const number = env.PR_NUMBER ?? '';
  const token = env.GITHUB_TOKEN ?? '';
  if (!repository || !/^[1-9]\d*$/.test(number) || !token) {
    return { skipFull: false, runProfiles: template };
  }
  try {
    const changed = await changedPullFiles(repository, number, token);
    return {
      skipFull: shouldSkipFull(changed.files, changed.truncated),
      runProfiles: template && shouldRunProfiles(changed.files, changed.truncated),
    };
  } catch {
    return { skipFull: false, runProfiles: template };
  }
}

export async function decideSkipFull(env = process.env) {
  return (await classifyCi(env)).skipFull;
}

async function main() {
  const result = await classifyCi();
  writeOutput(result.skipFull, result.runProfiles);
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  await main();
}
