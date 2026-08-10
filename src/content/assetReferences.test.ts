import activeAssetFixture from "../../tests/fixtures/active-assets.json";

import type { LocalImageAsset } from "./models";
import { profile } from "./profile";
import { projects } from "./projects";
import { recognitions } from "./recognitions";

type ActiveAssetRecord = (typeof activeAssetFixture.assets)[number];

function fileName(assetPath: string): string {
  return assetPath.split("/").at(-1) ?? "";
}

function expectImportedAssetReference(
  actualReference: string,
  fixturePath: string,
): void {
  expect(actualReference.split(/[?#]/u)[0].endsWith(`/${fileName(fixturePath)}`)).toBe(
    true,
  );
  expect(actualReference).not.toContain("/umesh-gangadharaiah/");
  expect(actualReference).not.toContain("/assets/images/");
}

function fixtureRecord(id: string): ActiveAssetRecord {
  const record = activeAssetFixture.assets.find((asset) => asset.id === id);
  expect(record).toBeDefined();
  if (!record) throw new Error(`Missing active asset fixture record: ${id}`);
  return record;
}

function expectLocalImageMatchesFixture(
  image: LocalImageAsset,
  record: ActiveAssetRecord,
): void {
  expectImportedAssetReference(image.fallbackSrc, record.fallback);
  expect(image.width).toBe(record.width);
  expect(image.height).toBe(record.height);
  expect(image.sources).toHaveLength(2);
  expect(image.sources.map(({ width }) => width)).toEqual(
    record.variants.map(({ width }) => width),
  );
  expect(image.sources.every(({ type }) => type === "image/webp")).toBe(true);

  for (const [index, source] of image.sources.entries()) {
    expectImportedAssetReference(source.src, record.variants[index].path);
  }
}

describe("active portfolio asset references", () => {
  it("locks the complete source-to-target fixture and responsive width policy", () => {
    const counts = activeAssetFixture.assets.reduce<Record<string, number>>(
      (totals, record) => ({
        ...totals,
        [record.recordType]: (totals[record.recordType] ?? 0) + 1,
      }),
      {},
    );

    expect(activeAssetFixture.assets).toHaveLength(36);
    expect(counts).toEqual({ portrait: 1, project: 10, recognition: 25 });
    expect(activeAssetFixture.remoteProjects).toHaveLength(2);
    expect(new Set(activeAssetFixture.assets.map(({ id }) => id)).size).toBe(36);
    expect(
      new Set(
        activeAssetFixture.assets.flatMap(({ fallback, variants }) => [
          fallback,
          ...variants.map(({ path }) => path),
        ]),
      ).size,
    ).toBe(108);

    for (const record of activeAssetFixture.assets) {
      expect(record.sha256).toMatch(/^[a-f0-9]{64}$/u);
      expect(record.width).toBeGreaterThan(0);
      expect(record.height).toBeGreaterThan(0);
      expect(record.source).not.toContain("/umesh-gangadharaiah/");
      expect(record.fallback).not.toContain("/umesh-gangadharaiah/");
      expect(record.variants).toHaveLength(2);
      expect(record.variants.map(({ width }) => width)).toEqual(
        record.recordType === "portrait"
          ? [320, 640]
          : record.recordType === "project"
            ? [640, 960]
            : [480, 960],
      );
    }
  });

  it("maps every typed local image to its imported original and WebP variants", () => {
    expectLocalImageMatchesFixture(
      profile.portrait,
      fixtureRecord("profile-portrait"),
    );

    const localProjects = projects.filter(
      (project): project is typeof project & { image: LocalImageAsset } =>
        project.image.kind === "local",
    );
    expect(localProjects).toHaveLength(10);
    for (const project of localProjects) {
      expectLocalImageMatchesFixture(project.image, fixtureRecord(project.id));
    }

    expect(recognitions).toHaveLength(25);
    for (const recognition of recognitions) {
      expectLocalImageMatchesFixture(
        recognition.image,
        fixtureRecord(recognition.id),
      );
    }
  });

  it("retains only the two approved remote Cisco project images", () => {
    expect(
      projects.flatMap(({ id, image }) =>
        image.kind === "remote" ? [{ id, src: image.src }] : [],
      ),
    ).toEqual(activeAssetFixture.remoteProjects);
    expect(projects.find(({ id }) => id === "ndo-search-explore")?.image.kind).toBe(
      "local",
    );
  });
});
