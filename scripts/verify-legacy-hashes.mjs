import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const fixtureRelativePath = 'tests/fixtures/legacy-content.sha256';
const fixturePath = path.join(repoRoot, fixtureRelativePath);
const fixtureLine = /^([0-9a-f]{64}) {2}(.+)$/;
const expectedSourceCount = 6;

function parseFixture(contents) {
  const entries = [];
  const seenPaths = new Set();

  for (const [index, line] of contents.split('\n').entries()) {
    if (line.trim() === '') {
      continue;
    }

    const match = fixtureLine.exec(line);
    if (!match) {
      throw new Error(`Malformed legacy content fixture line ${index + 1}.`);
    }

    const [, expectedHash, relativePath] = match;
    const sourcePath = path.resolve(repoRoot, relativePath);
    const resolvedRelativePath = path.relative(repoRoot, sourcePath);

    if (
      path.isAbsolute(relativePath) ||
      resolvedRelativePath === '' ||
      resolvedRelativePath === '..' ||
      resolvedRelativePath.startsWith(`..${path.sep}`)
    ) {
      throw new Error(`Malformed legacy content fixture line ${index + 1}.`);
    }

    if (seenPaths.has(resolvedRelativePath)) {
      throw new Error(`Duplicate legacy content fixture path: ${relativePath}`);
    }

    seenPaths.add(resolvedRelativePath);
    entries.push({ expectedHash, relativePath, sourcePath });
  }

  return entries;
}

async function verifyLegacyContent() {
  let fixture;
  try {
    fixture = await readFile(fixturePath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`Legacy content fixture missing: ${fixtureRelativePath}`);
    }
    throw error;
  }

  const entries = parseFixture(fixture);
  if (entries.length !== expectedSourceCount) {
    throw new Error(`Expected ${expectedSourceCount} legacy content fixture entries.`);
  }

  for (const { expectedHash, relativePath, sourcePath } of entries) {
    let source;
    try {
      source = await readFile(sourcePath);
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        throw new Error(`Legacy content source missing: ${relativePath}`);
      }
      throw error;
    }

    const actualHash = createHash('sha256').update(source).digest('hex');
    if (actualHash !== expectedHash) {
      throw new Error(`Legacy content hash mismatch: ${relativePath}`);
    }
  }

  console.log('Verified 6 legacy content sources.');
}

verifyLegacyContent().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
