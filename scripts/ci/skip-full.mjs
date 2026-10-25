import { appendFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const docsPrefixes = ['docs/', '.agents/'];
const docsFiles = new Set(['LICENSE', 'LICENSE.txt']);

export function isDocsOnlyPath(path) {
  const normalized = String(path ?? '')
    .replaceAll('\\', '/')
    .replace(/^\.\//, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.split('/').some((part) => part === '.' || part === '..')
  ) {
    return false;
  }
  if (docsFiles.has(normalized)) return true;
  if (docsPrefixes.some((prefix) => normalized.startsWith(prefix))) return true;
  return normalized.endsWith('.md');
}

export function shouldSkipFull(paths, truncated = false) {
  if (truncated || !Array.isArray(paths) || paths.length === 0) return false;
  return paths.every((path) => typeof path === 'string' && isDocsOnlyPath(path));
}

function writeOutput(skip) {
  const line = `skip_full=${skip ? 'true' : 'false'}\n`;
  const output = process.env.GITHUB_OUTPUT;
  if (output) appendFileSync(output, line);
  process.stdout.write(line);
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

export async function decideSkipFull(env = process.env) {
  if (env.GITHUB_EVENT_NAME !== 'pull_request') return false;
  const repository = env.GITHUB_REPOSITORY ?? '';
  const number = env.PR_NUMBER ?? '';
  const token = env.GITHUB_TOKEN ?? '';
  if (!repository || !/^[1-9]\d*$/.test(number) || !token) return false;
  try {
    const changed = await changedPullFiles(repository, number, token);
    return shouldSkipFull(changed.files, changed.truncated);
  } catch {
    return false;
  }
}

async function main() {
  writeOutput(await decideSkipFull());
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  await main();
}
