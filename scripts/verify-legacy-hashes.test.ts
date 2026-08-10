// @vitest-environment node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const realVerifierPath = fileURLToPath(new URL('./verify-legacy-hashes.mjs', import.meta.url));

interface FixtureEntry {
  contents: string;
  expectedHash: string;
  relativePath: string;
}

let fixtureEntries: FixtureEntry[];
let temporaryRepoRoot: string;

function sha256(contents: string) {
  return createHash('sha256').update(contents).digest('hex');
}

async function writeFixture(entries: readonly FixtureEntry[]) {
  const fixture = entries
    .map(({ expectedHash, relativePath }) => `${expectedHash}  ${relativePath}`)
    .join('\n');

  await writeFile(
    path.join(temporaryRepoRoot, 'tests/fixtures/legacy-content.sha256'),
    `${fixture}\n`,
    'utf8',
  );
}

function runVerifier() {
  const result = spawnSync(
    process.execPath,
    [path.join(temporaryRepoRoot, 'scripts/verify-legacy-hashes.mjs')],
    {
      cwd: tmpdir(),
      encoding: 'utf8',
    },
  );

  if (result.error) {
    throw result.error;
  }

  return result;
}

beforeEach(async () => {
  temporaryRepoRoot = await mkdtemp(path.join(tmpdir(), 'legacy-hash-verifier-'));
  await mkdir(path.join(temporaryRepoRoot, 'scripts'));
  await mkdir(path.join(temporaryRepoRoot, 'tests/fixtures'), { recursive: true });
  await copyFile(
    realVerifierPath,
    path.join(temporaryRepoRoot, 'scripts/verify-legacy-hashes.mjs'),
  );

  fixtureEntries = Array.from({ length: 6 }, (_, index) => {
    const contents = `legacy content ${index + 1}\n`;
    return {
      contents,
      expectedHash: sha256(contents),
      relativePath: `content/source-${index + 1}.txt`,
    };
  });

  for (const { contents, relativePath } of fixtureEntries) {
    const sourcePath = path.join(temporaryRepoRoot, relativePath);
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, contents, 'utf8');
  }

  await writeFixture(fixtureEntries);
});

afterEach(async () => {
  await rm(temporaryRepoRoot, { force: true, recursive: true });
});

describe('verify-legacy-hashes', () => {
  it('prints the exact success message for six matching sources', () => {
    const result = runVerifier();

    expect(result.status).toBe(0);
    expect(result.stdout).toBe('Verified 6 legacy content sources.\n');
    expect(result.stderr).toBe('');
  });

  it('rejects a malformed fixture line', async () => {
    const malformedHash = `A${fixtureEntries[0].expectedHash.slice(1)}`;
    await writeFixture([
      { ...fixtureEntries[0], expectedHash: malformedHash },
      ...fixtureEntries.slice(1),
    ]);

    const result = runVerifier();

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('Malformed legacy content fixture line 1.\n');
  });

  it('rejects duplicate normalized source paths', async () => {
    await writeFixture([
      fixtureEntries[0],
      { ...fixtureEntries[1], relativePath: 'content/nested/../source-1.txt' },
      ...fixtureEntries.slice(2),
    ]);

    const result = runVerifier();

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe(
      'Duplicate legacy content fixture path: content/nested/../source-1.txt\n',
    );
  });

  it.each(['traversal', 'absolute'] as const)('rejects a %s source path', async (pathKind) => {
    const invalidPath =
      pathKind === 'traversal' ? '../outside.txt' : path.join(temporaryRepoRoot, 'outside.txt');
    await writeFixture([{ ...fixtureEntries[0], relativePath: invalidPath }, ...fixtureEntries.slice(1)]);

    const result = runVerifier();

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('Malformed legacy content fixture line 1.\n');
  });

  it('reports a missing source path without exposing content', async () => {
    await rm(path.join(temporaryRepoRoot, fixtureEntries[0].relativePath));

    const result = runVerifier();

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('Legacy content source missing: content/source-1.txt\n');
  });

  it('reports a hash mismatch without exposing content', async () => {
    await writeFile(
      path.join(temporaryRepoRoot, fixtureEntries[0].relativePath),
      'changed content\n',
      'utf8',
    );

    const result = runVerifier();

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('Legacy content hash mismatch: content/source-1.txt\n');
  });
});
