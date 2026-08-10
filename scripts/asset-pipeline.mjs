import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

export const fixtureRelativePath = "tests/fixtures/active-assets.json";
export const portfolioAssetRelativeRoot = "src/assets/portfolio";

const allowedRecordTypes = new Set(["portrait", "project", "recognition"]);
const assetFields = [
  "id",
  "recordType",
  "source",
  "fallback",
  "sha256",
  "width",
  "height",
  "variants",
];
const expectedCounts = { portrait: 1, project: 10, recognition: 25 };
const repositoryDirectoryName = "umesh-gangadharaiah";
const expectedWidths = {
  portrait: [320, 640],
  project: [640, 960],
  recognition: [480, 960],
};
const targetDirectories = {
  portrait: "portrait",
  project: "projects",
  recognition: "recognitions",
};
const expectedRemoteProjects = [
  {
    id: "ndo-l4l7-service-chaining",
    src: "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png",
  },
  {
    id: "aci-advanced-pbr",
    src: "https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/white-paper-c11-743107.docx/_jcr_content/renditions/white-paper-c11-743107_11.png",
  },
];

function invalidFixture(message) {
  throw new Error(`Invalid active asset fixture: ${message}`);
}

function unsafeFilesystem(message) {
  throw new Error(`Unsafe active asset filesystem: ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateExactFields(value, fields, prefix) {
  const expectedFields = new Set(fields);
  for (const field of Object.keys(value)) {
    if (!expectedFields.has(field)) {
      invalidFixture(`${prefix}: unexpected field ${field}`);
    }
  }
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) {
      invalidFixture(`${prefix}: missing field ${field}`);
    }
  }
}

function relativePathEscapes(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    path.isAbsolute(relative) ||
    relative.split(path.sep)[0] === ".."
  );
}

function isMissingPathError(error) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function validateFilesystemPath(
  repositoryRoot,
  { absolutePath, relativePath, required },
) {
  const components = path.relative(repositoryRoot, absolutePath).split(path.sep);
  let currentPath = repositoryRoot;

  for (const [index, component] of components.entries()) {
    currentPath = path.join(currentPath, component);
    let stats;
    try {
      stats = await lstat(currentPath);
    } catch (error) {
      if (isMissingPathError(error)) {
        if (required) {
          unsafeFilesystem(`${relativePath}: expected a regular file`);
        }
        return;
      }
      throw error;
    }

    if (stats.isSymbolicLink()) {
      unsafeFilesystem(
        `${relativePath}: symbolic link component ${path.relative(repositoryRoot, currentPath)} is not allowed`,
      );
    }

    const isTarget = index === components.length - 1;
    if (isTarget) {
      if (!stats.isFile()) {
        unsafeFilesystem(`${relativePath}: expected a regular file`);
      }
    } else if (!stats.isDirectory()) {
      unsafeFilesystem(
        `${relativePath}: ancestor ${path.relative(repositoryRoot, currentPath)} must be a directory`,
      );
    }
  }
}

function validateRelativePath(value, { containmentRoot, label, repositoryRoot }) {
  if (typeof value !== "string" || value.length === 0) {
    invalidFixture(`${label}: path must be a non-empty string`);
  }
  if (value.includes("\\")) {
    invalidFixture(`${label}: path must use POSIX separators`);
  }
  if (path.posix.isAbsolute(value) || path.isAbsolute(value)) {
    invalidFixture(`${label}: absolute paths are not allowed`);
  }
  if (value.split("/").includes(repositoryDirectoryName)) {
    invalidFixture(`${label}: hard-coded repository base path is not allowed`);
  }
  if (path.posix.normalize(value) !== value || value === ".") {
    invalidFixture(`${label}: path must be a normalized POSIX relative path`);
  }

  const absolute = path.resolve(repositoryRoot, value);
  if (relativePathEscapes(containmentRoot, absolute)) {
    invalidFixture(`${label}: path is outside its allowed root`);
  }
  return absolute;
}

function validateRemoteProjects(remoteProjects) {
  if (!Array.isArray(remoteProjects)) {
    invalidFixture("remoteProjects must be an array");
  }
  if (remoteProjects.length !== expectedRemoteProjects.length) {
    invalidFixture(
      `expected ${expectedRemoteProjects.length} remote project records, found ${remoteProjects.length}`,
    );
  }

  const sanitized = remoteProjects.map((remoteProject, index) => {
    const prefix = `remote project record ${index + 1}`;
    if (!isPlainObject(remoteProject)) {
      invalidFixture(`${prefix} must be an object`);
    }
    validateExactFields(remoteProject, ["id", "src"], prefix);
    if (typeof remoteProject.id !== "string" || remoteProject.id.length === 0) {
      invalidFixture(`${prefix}: id must be a non-empty string`);
    }
    if (typeof remoteProject.src !== "string") {
      invalidFixture(`${prefix}: src must be an HTTPS URL`);
    }
    let remoteUrl;
    try {
      remoteUrl = new URL(remoteProject.src);
    } catch {
      invalidFixture(`${prefix}: src must be an HTTPS URL`);
    }
    if (remoteUrl.protocol !== "https:") {
      invalidFixture(`${prefix}: src must be an HTTPS URL`);
    }
    return { id: remoteProject.id, src: remoteProject.src };
  });

  if (
    sanitized.some(
      ({ id }, index) => id !== expectedRemoteProjects[index].id,
    )
  ) {
    invalidFixture("remote project IDs do not match the locked active records");
  }
  if (
    sanitized.some(
      ({ src }, index) => src !== expectedRemoteProjects[index].src,
    )
  ) {
    invalidFixture("remote project sources do not match the locked active records");
  }
  return sanitized;
}

function validateAssets(assets, repositoryRoot) {
  if (!Array.isArray(assets)) {
    invalidFixture("assets must be an array");
  }
  if (assets.length !== 36) {
    invalidFixture(`expected 36 local asset records, found ${assets.length}`);
  }

  const portfolioRoot = path.resolve(
    repositoryRoot,
    portfolioAssetRelativeRoot,
  );
  const ids = new Set();
  const sources = new Set();
  const targets = new Set();
  const counts = { portrait: 0, project: 0, recognition: 0 };

  const records = assets.map((record, index) => {
    if (!isPlainObject(record)) {
      invalidFixture(`asset record ${index + 1} must be an object`);
    }
    const initialPrefix =
      typeof record.id === "string" && record.id.length > 0
        ? `asset ${record.id}`
        : `asset record ${index + 1}`;
    validateExactFields(record, assetFields, initialPrefix);

    if (
      typeof record.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(record.id)
    ) {
      invalidFixture(`${initialPrefix}: record ID is invalid`);
    }
    const prefix = `asset ${record.id}`;
    if (ids.has(record.id)) {
      invalidFixture(`${prefix}: duplicate record ID`);
    }
    ids.add(record.id);

    if (!allowedRecordTypes.has(record.recordType)) {
      invalidFixture(`${prefix}: invalid record type ${String(record.recordType)}`);
    }
    counts[record.recordType] += 1;

    const sourcePath = validateRelativePath(record.source, {
      containmentRoot: repositoryRoot,
      label: `${prefix} historical source`,
      repositoryRoot,
    });
    if (sources.has(sourcePath)) {
      invalidFixture(`${prefix}: duplicate historical source`);
    }
    sources.add(sourcePath);

    const recordTargetRoot = path.resolve(
      portfolioRoot,
      targetDirectories[record.recordType],
    );
    const fallbackPath = validateRelativePath(record.fallback, {
      containmentRoot: recordTargetRoot,
      label: `${prefix} fallback target`,
      repositoryRoot,
    });
    if (targets.has(fallbackPath)) {
      invalidFixture(`${prefix}: duplicate target ${record.fallback}`);
    }
    targets.add(fallbackPath);

    if (path.posix.extname(record.source) !== path.posix.extname(record.fallback)) {
      invalidFixture(`${prefix}: fallback extension must match its historical source`);
    }
    if (!/^[a-f0-9]{64}$/u.test(record.sha256)) {
      invalidFixture(`${prefix}: source SHA-256 is invalid`);
    }
    if (!Number.isInteger(record.width) || record.width <= 0) {
      invalidFixture(`${prefix}: intrinsic width is invalid`);
    }
    if (!Number.isInteger(record.height) || record.height <= 0) {
      invalidFixture(`${prefix}: intrinsic height is invalid`);
    }
    if (!Array.isArray(record.variants)) {
      invalidFixture(`${prefix}: variants must be an array`);
    }
    if (record.variants.length !== 2) {
      invalidFixture(`${prefix}: expected exactly 2 variants`);
    }

    const widths = record.variants.map((variant) =>
      isPlainObject(variant) ? variant.width : undefined,
    );
    if (
      JSON.stringify(widths) !==
      JSON.stringify(expectedWidths[record.recordType])
    ) {
      invalidFixture(`${prefix}: responsive widths do not match the locked policy`);
    }

    const variants = record.variants.map((variant, variantIndex) => {
      const variantPrefix = `${prefix} variant ${variantIndex + 1}`;
      if (!isPlainObject(variant)) {
        invalidFixture(`${variantPrefix} must be an object`);
      }
      validateExactFields(variant, ["path", "width"], variantPrefix);
      if (!Number.isInteger(variant.width) || variant.width <= 0) {
        invalidFixture(`${variantPrefix}: width is invalid`);
      }
      const targetPath = validateRelativePath(variant.path, {
        containmentRoot: recordTargetRoot,
        label: `${variantPrefix} target`,
        repositoryRoot,
      });
      if (targets.has(targetPath)) {
        invalidFixture(`${prefix}: duplicate target ${variant.path}`);
      }
      targets.add(targetPath);
      if (path.posix.extname(variant.path) !== ".webp") {
        invalidFixture(`${variantPrefix}: target must use the WebP extension`);
      }

      const fallbackStem = record.fallback.slice(
        0,
        -path.posix.extname(record.fallback).length,
      );
      const expectedPath = `${fallbackStem}-${variant.width}.webp`;
      if (variant.path !== expectedPath) {
        invalidFixture(
          `${variantPrefix}: target must be ${expectedPath}`,
        );
      }
      return { path: variant.path, width: variant.width, targetPath };
    });

    return {
      id: record.id,
      recordType: record.recordType,
      source: record.source,
      fallback: record.fallback,
      sha256: record.sha256,
      width: record.width,
      height: record.height,
      variants,
      sourcePath,
      fallbackPath,
    };
  });

  for (const [recordType, expectedCount] of Object.entries(expectedCounts)) {
    if (counts[recordType] !== expectedCount) {
      invalidFixture(
        `expected ${expectedCount} ${recordType} records, found ${counts[recordType]}`,
      );
    }
  }

  return { records, targetPaths: targets };
}

export function repositoryRootForModule(moduleUrl) {
  return path.resolve(path.dirname(fileURLToPath(moduleUrl)), "..");
}

export function isDirectExecution(moduleUrl) {
  if (typeof process.argv[1] !== "string") return false;
  try {
    return (
      realpathSync(path.resolve(process.argv[1])) ===
      realpathSync(fileURLToPath(moduleUrl))
    );
  } catch {
    return false;
  }
}

export async function loadActiveAssetFixture(repositoryRoot) {
  const resolvedRoot = path.resolve(repositoryRoot);
  const fixturePath = path.resolve(resolvedRoot, fixtureRelativePath);
  let fixture;
  try {
    fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  } catch (error) {
    invalidFixture(
      `could not read ${fixtureRelativePath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (!isPlainObject(fixture)) {
    invalidFixture("root must be an object");
  }
  validateExactFields(fixture, ["remoteProjects", "assets"], "fixture");

  const remoteProjects = validateRemoteProjects(fixture.remoteProjects);
  const { records, targetPaths } = validateAssets(
    fixture.assets,
    resolvedRoot,
  );
  return {
    records,
    remoteProjects,
    targetPaths,
    portfolioRoot: path.resolve(resolvedRoot, portfolioAssetRelativeRoot),
    repositoryRoot: resolvedRoot,
  };
}

export async function validateActiveAssetFilesystem(fixture, mode) {
  if (!new Set(["generated", "optimizer", "source"]).has(mode)) {
    throw new Error(`Unknown active asset filesystem mode: ${String(mode)}`);
  }

  if (mode === "generated" || mode === "optimizer") {
    const required = mode === "generated";
    for (const record of fixture.records) {
      await validateFilesystemPath(fixture.repositoryRoot, {
        absolutePath: record.fallbackPath,
        relativePath: record.fallback,
        required,
      });
      for (const variant of record.variants) {
        await validateFilesystemPath(fixture.repositoryRoot, {
          absolutePath: variant.targetPath,
          relativePath: variant.path,
          required,
        });
      }
    }
  }

  if (mode === "source") {
    for (const record of fixture.records) {
      await validateFilesystemPath(fixture.repositoryRoot, {
        absolutePath: record.sourcePath,
        relativePath: record.source,
        required: true,
      });
    }
  }
}

async function inspectLockedAssetSource(fixture, record) {
  const errors = [];
  const prefix = `${record.id} (${record.source})`;

  try {
    await validateFilesystemPath(fixture.repositoryRoot, {
      absolutePath: record.sourcePath,
      relativePath: record.source,
      required: true,
    });
  } catch (error) {
    return [
      `${prefix}: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }

  let bytes;
  try {
    bytes = await readFile(record.sourcePath);
  } catch (error) {
    return [
      `${prefix}: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }

  const actualSha256 = createHash("sha256").update(bytes).digest("hex");
  if (actualSha256 !== record.sha256) {
    errors.push(
      `${prefix}: SHA-256 does not match the locked source (expected ${record.sha256}, found ${actualSha256})`,
    );
  }

  try {
    const metadata = await sharp(bytes).metadata();
    if (metadata.width !== record.width || metadata.height !== record.height) {
      errors.push(
        `${prefix}: expected ${record.width}x${record.height}, found ${metadata.width}x${metadata.height}`,
      );
    }
    await sharp(bytes).stats();
  } catch (error) {
    errors.push(
      `${prefix}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return errors;
}

export async function assertLockedAssetSources(fixture) {
  const sourceErrors = [];
  for (const record of fixture.records) {
    sourceErrors.push(await inspectLockedAssetSource(fixture, record));
  }
  const errors = sourceErrors.flat();

  if (errors.length > 0) {
    throw new Error(
      `Asset source integrity failed with ${errors.length} error(s):\n${errors
        .map((error) => `- ${error}`)
        .join("\n")}`,
    );
  }
}

export function createWebpVariant(input, width) {
  return sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 });
}
