import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  rename,
  rm,
  rmdir,
} from "node:fs/promises";
import path from "node:path";

import {
  assertLockedAssetSources,
  createWebpVariant,
  isDirectExecution,
  loadActiveAssetFixture,
  repositoryRootForModule,
  validateActiveAssetFilesystem,
} from "./asset-pipeline.mjs";

const stagingPrefix = ".portfolio-stage-";
const backupPrefix = ".portfolio-backup-";

function isMissingPathError(error) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function assertManagedTemporaryPath(target, parent, prefix) {
  const relative = path.relative(parent, target);
  if (
    relative === "" ||
    path.isAbsolute(relative) ||
    relative.split(path.sep)[0] === ".." ||
    path.dirname(relative) !== "." ||
    !path.basename(relative).startsWith(prefix) ||
    path.basename(relative).length <= prefix.length
  ) {
    throw new Error(`Refusing unsafe temporary asset path: ${target}`);
  }
}

async function createManagedTemporaryDirectory(parent, prefix) {
  const target = await mkdtemp(path.join(parent, prefix));
  assertManagedTemporaryPath(target, parent, prefix);
  return target;
}

async function removeManagedTemporaryDirectory(target, parent, prefix) {
  assertManagedTemporaryPath(target, parent, prefix);
  await rm(target, { force: true, recursive: true });
}

async function reserveManagedTemporaryPath(parent, prefix) {
  const target = await createManagedTemporaryDirectory(parent, prefix);
  try {
    await rmdir(target);
    return target;
  } catch (reservationError) {
    try {
      await removeManagedTemporaryDirectory(target, parent, prefix);
    } catch (cleanupError) {
      throw new Error(
        `Temporary path reservation failed (${reservationError instanceof Error ? reservationError.message : String(reservationError)}); cleanup failed (${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)})`,
      );
    }
    throw reservationError;
  }
}

function stagingTarget(stagingRoot, portfolioRoot, finalTarget) {
  const relative = path.relative(portfolioRoot, finalTarget);
  const target = path.resolve(stagingRoot, relative);
  const stagedRelative = path.relative(stagingRoot, target);
  if (
    relative === "" ||
    path.isAbsolute(relative) ||
    relative.split(path.sep)[0] === ".." ||
    stagedRelative === "" ||
    path.isAbsolute(stagedRelative) ||
    stagedRelative.split(path.sep)[0] === ".."
  ) {
    throw new Error(`Refusing unsafe staged asset target: ${finalTarget}`);
  }
  return target;
}

function expectedPortfolioDirectories(fixture) {
  const directories = new Set([fixture.portfolioRoot]);
  for (const target of fixture.targetPaths) {
    let directory = path.dirname(target);
    while (directory !== fixture.portfolioRoot) {
      directories.add(directory);
      directory = path.dirname(directory);
    }
  }
  return directories;
}

async function validateExistingPortfolioTree(fixture) {
  const expectedDirectories = expectedPortfolioDirectories(fixture);

  async function inspectDirectory(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      const isExpectedDirectory =
        entry.isDirectory() && expectedDirectories.has(target);
      const isExpectedFile = entry.isFile() && fixture.targetPaths.has(target);
      if (!isExpectedDirectory && !isExpectedFile) {
        throw new Error(
          `Unsafe active asset filesystem: unexpected portfolio entry ${path.relative(fixture.repositoryRoot, target)}`,
        );
      }
      if (isExpectedDirectory) await inspectDirectory(target);
    }
  }

  try {
    await inspectDirectory(fixture.portfolioRoot);
    return true;
  } catch (error) {
    if (isMissingPathError(error)) return false;
    throw error;
  }
}

async function validateNoUnresolvedPromotionArtifacts(portfolioParent) {
  const entries = await readdir(portfolioParent);
  const artifact = entries.find(
    (entry) =>
      entry.startsWith(stagingPrefix) || entry.startsWith(backupPrefix),
  );
  if (artifact) {
    throw new Error(
      `Unsafe active asset filesystem: unresolved promotion artifact ${path.join(portfolioParent, artifact)}`,
    );
  }
}

async function generateStagingTree(fixture, stagingRoot) {
  for (const record of fixture.records) {
    const fallback = stagingTarget(
      stagingRoot,
      fixture.portfolioRoot,
      record.fallbackPath,
    );
    await mkdir(path.dirname(fallback), { recursive: true });
    await copyFile(record.sourcePath, fallback);

    for (const variant of record.variants) {
      const target = stagingTarget(
        stagingRoot,
        fixture.portfolioRoot,
        variant.targetPath,
      );
      await mkdir(path.dirname(target), { recursive: true });
      await createWebpVariant(record.sourcePath, variant.width).toFile(target);
    }
  }
}

async function publishStagingTree(fixture, stagingRoot, hasExistingTree) {
  const portfolioParent = path.dirname(fixture.portfolioRoot);
  let backupRoot;

  if (hasExistingTree) {
    backupRoot = await reserveManagedTemporaryPath(portfolioParent, backupPrefix);
    await rename(fixture.portfolioRoot, backupRoot);
  }

  try {
    await rename(stagingRoot, fixture.portfolioRoot);
  } catch (promotionError) {
    if (backupRoot) {
      try {
        await rename(backupRoot, fixture.portfolioRoot);
        backupRoot = undefined;
      } catch (rollbackError) {
        throw new Error(
          `Portfolio promotion failed (${promotionError instanceof Error ? promotionError.message : String(promotionError)}); rollback failed (${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)})`,
        );
      }
    }
    throw promotionError;
  }

  return backupRoot;
}

export async function optimizeAssets(repositoryRoot) {
  const fixture = await loadActiveAssetFixture(repositoryRoot);
  await validateActiveAssetFilesystem(fixture, "optimizer");
  await assertLockedAssetSources(fixture);
  const { records } = fixture;
  const portfolioParent = path.dirname(fixture.portfolioRoot);
  await validateNoUnresolvedPromotionArtifacts(portfolioParent);
  const hasExistingTree = await validateExistingPortfolioTree(fixture);
  const stagingRoot = await createManagedTemporaryDirectory(
    portfolioParent,
    stagingPrefix,
  );
  let published = false;
  let cleanupWarning = "";

  try {
    await generateStagingTree(fixture, stagingRoot);
    const backupRoot = await publishStagingTree(
      fixture,
      stagingRoot,
      hasExistingTree,
    );
    published = true;
    if (backupRoot) {
      try {
        await removeManagedTemporaryDirectory(
          backupRoot,
          portfolioParent,
          backupPrefix,
        );
      } catch (cleanupError) {
        cleanupWarning = ` Warning: publication succeeded, but backup cleanup is pending at ${path.relative(fixture.repositoryRoot, backupRoot)} (${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}).`;
      }
    }
  } finally {
    if (!published) {
      await removeManagedTemporaryDirectory(
        stagingRoot,
        portfolioParent,
        stagingPrefix,
      );
    }
  }

  return `Generated ${records.length} byte-identical fallbacks and ${records.length * 2} WebP variants.${cleanupWarning}`;
}

if (isDirectExecution(import.meta.url)) {
  if (process.argv.length > 2) {
    console.error(`Unknown arguments: ${process.argv.slice(2).join(", ")}`);
    process.exitCode = 1;
  } else {
    try {
      console.log(await optimizeAssets(repositoryRootForModule(import.meta.url)));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
