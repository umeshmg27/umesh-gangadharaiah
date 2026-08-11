// @vitest-environment node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

type VariantRecord = {
  path: string;
  width: number;
};

type AssetRecord = {
  id: string;
  recordType: "portrait" | "project" | "recognition";
  source: string;
  fallback: string;
  sha256: string;
  width: number;
  height: number;
  variants: VariantRecord[];
  [key: string]: unknown;
};

type ActiveAssetFixture = {
  remoteProjects: { id: string; src: string }[];
  assets: AssetRecord[];
};

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRelativePath = "tests/fixtures/active-assets.json";
const portfolioRelativePath = "src/assets/portfolio";
const promotionArtifactPrefixes = [
  ".portfolio-stage-",
  ".portfolio-backup-",
];
const scriptNames = ["verify-assets.mjs", "optimize-images.mjs"] as const;
// These tests execute complete Sharp pipelines in child processes. Hosted
// runners are materially slower than developer machines, so retain bounded
// per-test budgets with enough headroom for the measured CI runtime.
const sourceMutationTestTimeoutMs = 30_000;
const deterministicOptimizationTestTimeoutMs = 60_000;

let fixture: ActiveAssetFixture;
let externalRoot: string;
let temporaryRoot: string;

async function copySharedModuleWhenPresent(): Promise<void> {
  try {
    await copyFile(
      path.join(repositoryRoot, "scripts/asset-pipeline.mjs"),
      path.join(temporaryRoot, "scripts/asset-pipeline.mjs"),
    );
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
      throw error;
    }
  }
}

async function writeFixture(nextFixture: ActiveAssetFixture): Promise<void> {
  await writeFile(
    path.join(temporaryRoot, fixtureRelativePath),
    `${JSON.stringify(nextFixture, null, 2)}\n`,
    "utf8",
  );
}

function runScript(scriptName: (typeof scriptNames)[number], args: string[] = []) {
  const result = spawnSync(
    process.execPath,
    [path.join(temporaryRoot, "scripts", scriptName), ...args],
    { cwd: tmpdir(), encoding: "utf8" },
  );
  if (result.error) throw result.error;
  return result;
}

async function copyHistoricalSource(record: AssetRecord): Promise<void> {
  const target = path.join(temporaryRoot, record.source);
  const preservedRecord = fixture.assets.find(({ id }) => id === record.id);
  if (!preservedRecord) throw new Error(`Unknown active asset: ${record.id}`);
  await mkdir(path.dirname(target), { recursive: true });
  // Fallbacks preserve the locked source bytes after legacy paths are removed.
  await copyFile(path.join(repositoryRoot, preservedRecord.fallback), target);
}

async function copyAllHistoricalSources(): Promise<void> {
  await Promise.all(fixture.assets.map(copyHistoricalSource));
}

async function digestGeneratedTargets(): Promise<string> {
  const hash = createHash("sha256");
  for (const record of fixture.assets) {
    for (const target of [
      record.fallback,
      ...record.variants.map((variant) => variant.path),
    ]) {
      hash.update(target);
      hash.update(await readFile(path.join(temporaryRoot, target)));
    }
  }
  return hash.digest("hex");
}

async function listFilesRecursively(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(target)));
    } else {
      files.push(target);
    }
  }
  return files.sort();
}

async function digestPortfolioTree(): Promise<string> {
  const portfolioRoot = path.join(temporaryRoot, portfolioRelativePath);
  const files = await listFilesRecursively(portfolioRoot);
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(portfolioRoot, file));
    hash.update(await readFile(file));
  }
  return hash.digest("hex");
}

async function listPromotionArtifacts(): Promise<string[]> {
  const portfolioParent = path.dirname(
    path.join(temporaryRoot, portfolioRelativePath),
  );
  const entries = await readdir(portfolioParent);
  return entries.filter((entry) =>
    promotionArtifactPrefixes.some((prefix) => entry.startsWith(prefix)),
  );
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function jpegWithUndecodableScan(bytes: Buffer): Buffer {
  if (bytes.length < 4 || bytes.readUInt16BE(0) !== 0xffd8) {
    throw new Error("Expected a JPEG start-of-image marker");
  }

  let markerOffset = 2;
  while (markerOffset < bytes.length) {
    if (bytes[markerOffset] !== 0xff) {
      throw new Error(`Expected a JPEG marker at byte ${markerOffset}`);
    }
    while (bytes[markerOffset] === 0xff) markerOffset += 1;
    const marker = bytes[markerOffset];
    markerOffset += 1;

    if (marker === 0xd9) {
      throw new Error("JPEG ended before a start-of-scan marker");
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (markerOffset + 2 > bytes.length) {
      throw new Error("JPEG segment length is truncated");
    }

    const segmentLength = bytes.readUInt16BE(markerOffset);
    if (segmentLength < 2) {
      throw new Error(`Invalid JPEG segment length ${segmentLength}`);
    }
    const segmentEnd = markerOffset + segmentLength;
    if (segmentEnd > bytes.length) {
      throw new Error("JPEG segment is truncated");
    }
    if (marker === 0xda) {
      const componentCountOffset = markerOffset + 2;
      const componentCount = bytes[componentCountOffset];
      if (componentCount < 1 || componentCountOffset + 2 >= segmentEnd) {
        throw new Error("JPEG start-of-scan has no component table selector");
      }

      const headerOnly = Buffer.from(bytes.subarray(0, segmentEnd));
      const firstTableSelectorOffset = componentCountOffset + 2;
      headerOnly[firstTableSelectorOffset] = 0xff;
      return headerOnly;
    }
    markerOffset = segmentEnd;
  }

  throw new Error("JPEG has no start-of-scan marker");
}

function expectSharedValidationFailure(
  verifier: ReturnType<typeof runScript>,
  optimizer: ReturnType<typeof runScript>,
  expectedFragment: string,
): void {
  for (const result of [verifier, optimizer]) {
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Invalid active asset fixture:");
    expect(result.stderr).toContain(expectedFragment);
    expect(result.stderr).not.toContain("TypeError");
    expect(result.stderr).not.toContain(" at ");
  }
  expect(optimizer.stderr).toBe(verifier.stderr);
}

function expectSharedFilesystemFailure(
  verifier: ReturnType<typeof runScript>,
  optimizer: ReturnType<typeof runScript>,
  expectedFragment: string,
): void {
  for (const result of [verifier, optimizer]) {
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unsafe active asset filesystem:");
    expect(result.stderr).toContain(expectedFragment);
    expect(result.stderr).not.toContain("TypeError");
    expect(result.stderr).not.toContain(" at ");
  }
  expect(optimizer.stderr).toBe(verifier.stderr);
}

beforeEach(async () => {
  temporaryRoot = await mkdtemp(path.join(tmpdir(), "active-asset-pipeline-"));
  externalRoot = await mkdtemp(path.join(tmpdir(), "active-asset-external-"));
  await mkdir(path.join(temporaryRoot, "scripts"));
  await mkdir(path.join(temporaryRoot, "tests/fixtures"), { recursive: true });

  await Promise.all(
    scriptNames.map((scriptName) =>
      copyFile(
        path.join(repositoryRoot, "scripts", scriptName),
        path.join(temporaryRoot, "scripts", scriptName),
      ),
    ),
  );
  await copySharedModuleWhenPresent();
  await copyFile(
    path.join(repositoryRoot, fixtureRelativePath),
    path.join(temporaryRoot, fixtureRelativePath),
  );
  await symlink(
    path.join(repositoryRoot, "node_modules"),
    path.join(temporaryRoot, "node_modules"),
    "dir",
  );

  fixture = JSON.parse(
    await readFile(path.join(repositoryRoot, fixtureRelativePath), "utf8"),
  ) as ActiveAssetFixture;
});

afterEach(async () => {
  await Promise.all(
    [temporaryRoot, externalRoot].map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

describe("active asset pipeline integrity", () => {
  it.each([
    {
      name: "raw-prefix traversal",
      value: () => "src/assets/portfolio/../../../escaped.jpg",
    },
    {
      name: "absolute",
      value: (root: string) => path.join(root, "absolute.jpg"),
    },
    {
      name: "backslash",
      value: () => "src\\assets\\portfolio\\portrait\\escaped.jpg",
    },
    {
      name: "non-normalized",
      value: () => "src/assets/portfolio/portrait/../escaped.jpg",
    },
  ])("rejects a $name target before either command writes", async ({ value }) => {
    const maliciousFixture = structuredClone(fixture);
    const firstRecord = maliciousFixture.assets[0];
    const invalidTarget = value(temporaryRoot);
    firstRecord.fallback = invalidTarget;
    await writeFixture(maliciousFixture);
    await copyHistoricalSource(firstRecord);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedValidationFailure(verifier, optimizer, firstRecord.id);
    expect(await exists(path.resolve(temporaryRoot, invalidTarget))).toBe(false);
    expect(await exists(path.join(temporaryRoot, firstRecord.variants[0].path))).toBe(
      false,
    );
  });

  it("rejects canonical duplicate targets before inspection or writes", async () => {
    const duplicateFixture = structuredClone(fixture);
    const firstRecord = duplicateFixture.assets[0];
    firstRecord.variants[0].path = firstRecord.fallback;
    await writeFixture(duplicateFixture);
    await copyHistoricalSource(firstRecord);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedValidationFailure(verifier, optimizer, "duplicate target");
    expect(await exists(path.join(temporaryRoot, firstRecord.fallback))).toBe(false);
  });

  it("rejects a target-file symlink without overwriting its external file", async () => {
    const firstRecord = fixture.assets[0];
    const target = path.join(temporaryRoot, firstRecord.fallback);
    const externalTarget = path.join(externalRoot, "portrait.jpg");
    const sentinel = Buffer.from("external target must stay unchanged");
    await copyHistoricalSource(firstRecord);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(externalTarget, sentinel);
    await symlink(externalTarget, target);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedFilesystemFailure(verifier, optimizer, firstRecord.fallback);
    expect(await readFile(externalTarget)).toEqual(sentinel);
    expect(await exists(path.join(temporaryRoot, firstRecord.variants[0].path))).toBe(
      false,
    );
  });

  it("rejects a target-ancestor symlink without writing outside the portfolio", async () => {
    const firstRecord = fixture.assets[0];
    const targetDirectory = path.dirname(
      path.join(temporaryRoot, firstRecord.fallback),
    );
    const externalMarker = path.join(externalRoot, "marker.txt");
    const sentinel = Buffer.from("external directory must stay unchanged");
    await copyHistoricalSource(firstRecord);
    await mkdir(path.dirname(targetDirectory), { recursive: true });
    await writeFile(externalMarker, sentinel);
    await symlink(externalRoot, targetDirectory);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedFilesystemFailure(verifier, optimizer, firstRecord.fallback);
    expect(await readFile(externalMarker)).toEqual(sentinel);
    expect(await exists(path.join(externalRoot, path.basename(firstRecord.fallback)))).toBe(
      false,
    );
  });

  it("rejects a historical-source symlink before reading or copying it", async () => {
    const firstRecord = fixture.assets[0];
    const source = path.join(temporaryRoot, firstRecord.source);
    const externalSource = path.join(externalRoot, "portrait.jpg");
    await mkdir(path.dirname(source), { recursive: true });
    await copyFile(path.join(repositoryRoot, firstRecord.fallback), externalSource);
    const externalBytes = await readFile(externalSource);
    await symlink(externalSource, source);

    const verifier = runScript("verify-assets.mjs", ["--source"]);
    const optimizer = runScript("optimize-images.mjs");

    expectSharedFilesystemFailure(verifier, optimizer, firstRecord.source);
    expect(await readFile(externalSource)).toEqual(externalBytes);
    expect(await exists(path.join(temporaryRoot, firstRecord.fallback))).toBe(false);
  });

  it(
    "collects locked source failures before creating staging outputs",
    async () => {
      await copyAllHistoricalSources();
      const lastRecord = fixture.assets.at(-1)!;
      const penultimateRecord = fixture.assets.at(-2)!;
      await sharp({
        create: {
          width: penultimateRecord.width,
          height: penultimateRecord.height,
          channels: 3,
          background: "#386f81",
        },
      })
        .jpeg()
        .toFile(path.join(temporaryRoot, penultimateRecord.source));
      await writeFile(
        path.join(temporaryRoot, lastRecord.source),
        "not a decodable image",
      );
      const externalMarker = path.join(externalRoot, "marker.txt");
      const sentinel = Buffer.from("external data must stay unchanged");
      await writeFile(externalMarker, sentinel);

      const result = runScript("optimize-images.mjs");

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("Asset source integrity failed with 3 error(s)");
      expect(result.stderr).toContain(penultimateRecord.id);
      expect(result.stderr).toContain(penultimateRecord.source);
      expect(result.stderr).toContain("SHA-256 does not match the locked source");
      expect(result.stderr).toContain(lastRecord.id);
      expect(result.stderr).toContain(lastRecord.source);
      expect(result.stderr).toContain("unsupported image format");
      expect(
        await listFilesRecursively(
          path.join(temporaryRoot, portfolioRelativePath),
        ),
      ).toEqual([]);
      expect(await listPromotionArtifacts()).toEqual([]);
      expect(await readFile(externalMarker)).toEqual(sentinel);
    },
    10_000,
  );

  it(
    "rejects a different same-dimension source before replacing valid targets",
    async () => {
      await copyAllHistoricalSources();
      await cp(
        path.join(repositoryRoot, portfolioRelativePath),
        path.join(temporaryRoot, portfolioRelativePath),
        { recursive: true },
      );
      const beforeDigest = await digestPortfolioTree();
      const lastRecord = fixture.assets.at(-1)!;
      await sharp({
        create: {
          width: lastRecord.width,
          height: lastRecord.height,
          channels: 3,
          background: "#7148a2",
        },
      })
        .jpeg()
        .toFile(path.join(temporaryRoot, lastRecord.source));
      const externalMarker = path.join(externalRoot, "marker.txt");
      const sentinel = Buffer.from("external data must stay unchanged");
      await writeFile(externalMarker, sentinel);

      const sourceVerification = runScript("verify-assets.mjs", ["--source"]);
      const result = runScript("optimize-images.mjs");
      const verification = runScript("verify-assets.mjs");

      expect(sourceVerification.status).toBe(1);
      expect(sourceVerification.stdout).toBe("");
      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("Asset source integrity failed with 1 error(s)");
      expect(result.stderr).toContain(lastRecord.id);
      expect(result.stderr).toContain(lastRecord.source);
      expect(result.stderr).toContain("SHA-256 does not match the locked source");
      expect(sourceVerification.stderr).toBe(result.stderr);
      expect(await digestPortfolioTree()).toBe(beforeDigest);
      expect(verification.status).toBe(0);
      expect(verification.stderr).toBe("");
      expect(await listPromotionArtifacts()).toEqual([]);
      expect(await readFile(externalMarker)).toEqual(sentinel);
    },
    sourceMutationTestTimeoutMs,
  );

  it(
    "rejects locked source dimension drift even when its SHA is updated",
    async () => {
      await copyAllHistoricalSources();
      await cp(
        path.join(repositoryRoot, portfolioRelativePath),
        path.join(temporaryRoot, portfolioRelativePath),
        { recursive: true },
      );
      const beforeDigest = await digestPortfolioTree();
      const changedFixture = structuredClone(fixture);
      const lastRecord = changedFixture.assets.at(-1)!;
      const changedSource = path.join(temporaryRoot, lastRecord.source);
      await sharp({
        create: {
          width: lastRecord.width,
          height: lastRecord.height - 1,
          channels: 3,
          background: "#a25931",
        },
      })
        .jpeg()
        .toFile(changedSource);
      lastRecord.sha256 = createHash("sha256")
        .update(await readFile(changedSource))
        .digest("hex");
      await writeFixture(changedFixture);

      const result = runScript("optimize-images.mjs");

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("Asset source integrity failed with 1 error(s)");
      expect(result.stderr).toContain(lastRecord.id);
      expect(result.stderr).toContain(lastRecord.source);
      expect(result.stderr).toContain(
        `expected ${lastRecord.width}x${lastRecord.height}, found ${lastRecord.width}x${lastRecord.height - 1}`,
      );
      expect(await digestPortfolioTree()).toBe(beforeDigest);
      expect(await listPromotionArtifacts()).toEqual([]);
    },
    10_000,
  );

  it(
    "fully decodes locked sources before creating a staging tree",
    async () => {
      await copyAllHistoricalSources();
      await cp(
        path.join(repositoryRoot, portfolioRelativePath),
        path.join(temporaryRoot, portfolioRelativePath),
        { recursive: true },
      );
      const beforeDigest = await digestPortfolioTree();
      const changedFixture = structuredClone(fixture);
      const lastRecord = changedFixture.assets.at(-1)!;
      const changedSource = path.join(temporaryRoot, lastRecord.source);
      const originalBytes = await readFile(changedSource);
      const truncatedBytes = jpegWithUndecodableScan(originalBytes);
      const metadata = await sharp(truncatedBytes).metadata();
      expect(metadata.width).toBe(lastRecord.width);
      expect(metadata.height).toBe(lastRecord.height);
      await expect(sharp(truncatedBytes).stats()).rejects.toThrow();
      await writeFile(changedSource, truncatedBytes);
      lastRecord.sha256 = createHash("sha256")
        .update(truncatedBytes)
        .digest("hex");
      await writeFixture(changedFixture);

      const sourceVerification = runScript("verify-assets.mjs", ["--source"]);
      const result = runScript("optimize-images.mjs");

      const detailPrefix = `- ${lastRecord.id} (${lastRecord.source}):`;
      for (const cliResult of [sourceVerification, result]) {
        expect(cliResult.status).toBe(1);
        expect(cliResult.stdout).toBe("");
        expect(cliResult.stderr).toContain(
          "Asset source integrity failed with 1 error(s):",
        );
        expect(cliResult.stderr).toContain(lastRecord.id);
        expect(cliResult.stderr).toContain(lastRecord.source);
        const detail = cliResult.stderr
          .split("\n")
          .find((line) => line.startsWith(detailPrefix))
          ?.slice(detailPrefix.length)
          .trim();
        expect(detail).toBeTruthy();
      }
      expect(await digestPortfolioTree()).toBe(beforeDigest);
      expect(await listPromotionArtifacts()).toEqual([]);
    },
    10_000,
  );

  it(
    "preserves an existing valid target tree when late generation fails",
    async () => {
      await copyAllHistoricalSources();
      await cp(
        path.join(repositoryRoot, portfolioRelativePath),
        path.join(temporaryRoot, portfolioRelativePath),
        { recursive: true },
      );
      const beforeDigest = await digestPortfolioTree();
      const lastRecord = fixture.assets.at(-1)!;
      await writeFile(
        path.join(temporaryRoot, lastRecord.source),
        "not a decodable image",
      );
      const externalMarker = path.join(externalRoot, "marker.txt");
      const sentinel = Buffer.from("external data must stay unchanged");
      await writeFile(externalMarker, sentinel);

      const result = runScript("optimize-images.mjs");
      const verification = runScript("verify-assets.mjs");

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("unsupported image format");
      expect(await digestPortfolioTree()).toBe(beforeDigest);
      expect(verification.status).toBe(0);
      expect(verification.stderr).toBe("");
      expect(await listPromotionArtifacts()).toEqual([]);
      expect(await readFile(externalMarker)).toEqual(sentinel);
    },
    10_000,
  );

  it(
    "rejects an orphan target before replacing an existing portfolio tree",
    async () => {
      await copyAllHistoricalSources();
      await cp(
        path.join(repositoryRoot, portfolioRelativePath),
        path.join(temporaryRoot, portfolioRelativePath),
        { recursive: true },
      );
      const orphan = path.join(
        temporaryRoot,
        portfolioRelativePath,
        "user-note.txt",
      );
      await writeFile(orphan, "keep this user file");
      const beforeDigest = await digestPortfolioTree();

      const result = runScript("optimize-images.mjs");

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("unexpected portfolio entry");
      expect(await digestPortfolioTree()).toBe(beforeDigest);
      expect(await readFile(orphan, "utf8")).toBe("keep this user file");
      expect(await listPromotionArtifacts()).toEqual([]);
    },
    10_000,
  );

  it(
    "refuses to accumulate an unresolved promotion backup",
    async () => {
      await copyAllHistoricalSources();
      await cp(
        path.join(repositoryRoot, portfolioRelativePath),
        path.join(temporaryRoot, portfolioRelativePath),
        { recursive: true },
      );
      const beforeDigest = await digestPortfolioTree();
      const staleBackup = path.join(
        temporaryRoot,
        "src/assets/.portfolio-backup-unresolved",
      );
      await mkdir(staleBackup);
      await writeFile(path.join(staleBackup, "marker.txt"), "inspect me");

      const result = runScript("optimize-images.mjs");

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("unresolved promotion artifact");
      expect(await digestPortfolioTree()).toBe(beforeDigest);
      expect(await readFile(path.join(staleBackup, "marker.txt"), "utf8")).toBe(
        "inspect me",
      );
      expect(await listPromotionArtifacts()).toEqual([
        ".portfolio-backup-unresolved",
      ]);
    },
    10_000,
  );

  it.each([
    {
      name: "missing variants",
      mutate: (nextFixture: ActiveAssetFixture) => {
        delete (nextFixture.assets[0] as Partial<AssetRecord>).variants;
      },
      fragment: "variants",
    },
    {
      name: "non-array variants",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.assets[0].variants = null as unknown as VariantRecord[];
      },
      fragment: "variants",
    },
    {
      name: "null asset record",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.assets[0] = null as unknown as AssetRecord;
      },
      fragment: "record 1",
    },
  ])("reports concise validation for $name without partial writes", async ({ mutate, fragment }) => {
    const malformedFixture = structuredClone(fixture);
    const firstFallback = malformedFixture.assets[0].fallback;
    await copyHistoricalSource(malformedFixture.assets[0]);
    mutate(malformedFixture);
    await writeFixture(malformedFixture);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedValidationFailure(verifier, optimizer, fragment);
    expect(await exists(path.join(temporaryRoot, firstFallback))).toBe(false);
  });

  it("validates the final record before writing the first fallback", async () => {
    const malformedFixture = structuredClone(fixture);
    const firstRecord = malformedFixture.assets[0];
    malformedFixture.assets.at(-1)!.variants =
      null as unknown as VariantRecord[];
    await copyHistoricalSource(firstRecord);
    await writeFixture(malformedFixture);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedValidationFailure(verifier, optimizer, "variants");
    expect(await exists(path.join(temporaryRoot, firstRecord.fallback))).toBe(
      false,
    );
  });

  it.each([
    {
      name: "unknown asset fields",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.assets[0].unexpected = true;
      },
      fragment: "unexpected field",
    },
    {
      name: "incorrect responsive widths",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.assets[1].variants[0].width = 641;
      },
      fragment: "responsive widths",
    },
    {
      name: "an unapproved remote project",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.remoteProjects[0].id = "unapproved-project";
      },
      fragment: "remote project IDs",
    },
    {
      name: "the wrong local record count",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.assets.pop();
      },
      fragment: "36 local asset records",
    },
    {
      name: "a hard-coded repository base",
      mutate: (nextFixture: ActiveAssetFixture) => {
        nextFixture.assets[0].source =
          "src/umesh-gangadharaiah/assets/umesh-ug.jpg";
      },
      fragment: "hard-coded repository base",
    },
  ])("applies strict shared validation to $name", async ({ mutate, fragment }) => {
    const invalidFixture = structuredClone(fixture);
    mutate(invalidFixture);
    await writeFixture(invalidFixture);

    const verifier = runScript("verify-assets.mjs");
    const optimizer = runScript("optimize-images.mjs");

    expectSharedValidationFailure(verifier, optimizer, fragment);
  });

  it("verifies generated targets without access to historical sources", async () => {
    await cp(
      path.join(repositoryRoot, portfolioRelativePath),
      path.join(temporaryRoot, portfolioRelativePath),
      { recursive: true },
    );
    expect(
      await exists(path.join(temporaryRoot, fixture.assets[0].source)),
    ).toBe(false);

    const result = runScript("verify-assets.mjs");

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Verified 36 local originals");
    expect(result.stdout).toContain("generated targets");
  });

  it("keeps the public NexusOne fallback free of embedded authoring metadata", async () => {
    const record = fixture.assets.find(({ id }) => id === "nd-nexusone");
    expect(record).toBeDefined();
    if (!record) return;

    const metadata = await sharp(
      path.join(repositoryRoot, record.fallback),
    ).metadata();

    expect(metadata.exif).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    expect(metadata.iptc).toBeUndefined();
  });

  it(
    "optimizes, verifies, and deterministically re-optimizes an isolated root",
    async () => {
      await copyAllHistoricalSources();

      const firstOptimization = runScript("optimize-images.mjs");
      const firstDigest = await digestGeneratedTargets();
      const verification = runScript("verify-assets.mjs");
      const secondOptimization = runScript("optimize-images.mjs");
      const secondDigest = await digestGeneratedTargets();

      expect(firstOptimization.status).toBe(0);
      expect(firstOptimization.stderr).toBe("");
      expect(firstOptimization.stdout).toContain("72 WebP variants");
      expect(verification.status).toBe(0);
      expect(verification.stderr).toBe("");
      expect(secondOptimization.status).toBe(0);
      expect(secondOptimization.stderr).toBe("");
      expect(secondDigest).toBe(firstDigest);
      expect(await listPromotionArtifacts()).toEqual([]);
    },
    deterministicOptimizationTestTimeoutMs,
  );

  it("rejects a different same-dimension WebP instead of trusting metadata", async () => {
    await cp(
      path.join(repositoryRoot, portfolioRelativePath),
      path.join(temporaryRoot, portfolioRelativePath),
      { recursive: true },
    );
    const record = fixture.assets.find(({ id }) => id === "nd-nexusone");
    expect(record).toBeDefined();
    if (!record) return;
    const variant = record.variants[0];
    const target = path.join(temporaryRoot, variant.path);
    const metadata = await sharp(target).metadata();
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.height).toBeGreaterThan(0);

    await sharp({
      create: {
        width: metadata.width ?? 1,
        height: metadata.height ?? 1,
        channels: 3,
        background: "#6d42c7",
      },
    })
      .webp({ quality: 82, effort: 6 })
      .toFile(target);

    const result = runScript("verify-assets.mjs");

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(variant.path);
    expect(result.stderr).toContain("deterministic generation");
    expect(result.stderr).not.toContain("TypeError");
  });

  it("keeps rejecting unknown verifier arguments", () => {
    const result = runScript("verify-assets.mjs", ["--unexpected"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown arguments: --unexpected");
  });
});
