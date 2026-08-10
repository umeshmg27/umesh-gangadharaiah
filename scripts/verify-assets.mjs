import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  assertLockedAssetSources,
  createWebpVariant,
  isDirectExecution,
  loadActiveAssetFixture,
  portfolioAssetRelativeRoot,
  repositoryRootForModule,
  validateActiveAssetFilesystem,
} from "./asset-pipeline.mjs";

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function inspectOriginal(record, relativePath, absolutePath) {
  const errors = [];
  const prefix = `${record.id} (${relativePath})`;

  try {
    const bytes = await readFile(absolutePath);
    if (digest(bytes) !== record.sha256) {
      errors.push(`${prefix}: SHA-256 does not match the locked source`);
    }

    const metadata = await sharp(bytes).metadata();
    if (metadata.width !== record.width || metadata.height !== record.height) {
      errors.push(
        `${prefix}: expected ${record.width}x${record.height}, found ${metadata.width}x${metadata.height}`,
      );
    }
  } catch (error) {
    errors.push(`${prefix}: ${error.message}`);
  }

  return errors;
}

async function inspectVariant(record, variant) {
  const errors = [];
  const prefix = `${record.id} (${variant.path})`;

  try {
    const bytes = await readFile(variant.targetPath);
    const metadata = await sharp(bytes).metadata();
    const expectedWidth = Math.min(record.width, variant.width);
    const scaledHeight = (record.height * expectedWidth) / record.width;
    const minimumExpectedHeight = Math.floor(scaledHeight);
    const maximumExpectedHeight = Math.ceil(scaledHeight);

    if (metadata.format !== "webp") {
      errors.push(`${prefix}: expected WebP format, found ${metadata.format}`);
    }
    if (
      metadata.width !== expectedWidth ||
      metadata.height < minimumExpectedHeight ||
      metadata.height > maximumExpectedHeight
    ) {
      errors.push(
        `${prefix}: expected width ${expectedWidth} and proportional height ${minimumExpectedHeight}-${maximumExpectedHeight}, found ${metadata.width}x${metadata.height}`,
      );
    }
    if (metadata.exif || metadata.icc || metadata.iptc || metadata.xmp) {
      errors.push(`${prefix}: generated variant contains metadata`);
    }

    const expectedBytes = await createWebpVariant(
      record.fallbackPath,
      variant.width,
    ).toBuffer();
    if (!bytes.equals(expectedBytes)) {
      errors.push(
        `${prefix}: bytes do not match deterministic generation from ${record.fallback}`,
      );
    }
  } catch (error) {
    errors.push(`${prefix}: ${error.message}`);
  }

  return errors;
}

async function listFiles(repositoryRoot, relativeDirectory) {
  const directory = path.resolve(repositoryRoot, relativeDirectory);
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const relativeEntry = path.posix.join(relativeDirectory, entry.name);
      return entry.isDirectory()
        ? listFiles(repositoryRoot, relativeEntry)
        : [path.resolve(repositoryRoot, relativeEntry)];
    }),
  );
  return nestedFiles.flat();
}

export async function verifyAssets({ repositoryRoot, sourceMode = false }) {
  const fixture = await loadActiveAssetFixture(repositoryRoot);
  if (sourceMode) {
    await assertLockedAssetSources(fixture);
  } else {
    await validateActiveAssetFilesystem(fixture, "generated");
  }
  const { records, remoteProjects, targetPaths } = fixture;
  const errors = [];

  if (!sourceMode) {
    const fallbackErrors = await Promise.all(
      records.map((record) =>
        inspectOriginal(record, record.fallback, record.fallbackPath),
      ),
    );
    const variantErrors = await Promise.all(
      records.flatMap((record) =>
        record.variants.map((variant) => inspectVariant(record, variant)),
      ),
    );
    errors.push(...fallbackErrors.flat(), ...variantErrors.flat());

    const actualTargetPaths = await listFiles(
      repositoryRoot,
      portfolioAssetRelativeRoot,
    );
    for (const actualPath of actualTargetPaths) {
      if (!targetPaths.has(actualPath)) {
        errors.push(
          `orphan target not present in fixture: ${path.relative(repositoryRoot, actualPath)}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Asset verification failed with ${errors.length} error(s):\n${errors
        .map((error) => `- ${error}`)
        .join("\n")}`,
    );
  }

  const modeLabel = sourceMode ? "historical sources" : "generated targets";
  return `Verified ${records.length} local originals and ${remoteProjects.length} remote project image records (${modeLabel}).`;
}

if (isDirectExecution(import.meta.url)) {
  const argumentsSet = new Set(process.argv.slice(2));
  const sourceMode = argumentsSet.delete("--source");
  if (argumentsSet.size > 0) {
    console.error(`Unknown arguments: ${[...argumentsSet].join(", ")}`);
    process.exitCode = 1;
  } else {
    try {
      console.log(
        await verifyAssets({
          repositoryRoot: repositoryRootForModule(import.meta.url),
          sourceMode,
        }),
      );
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
