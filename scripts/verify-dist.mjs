import assert from "node:assert/strict";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const distRoot = path.join(repositoryRoot, "dist");
const canonicalUrl =
  "https://umeshmg27.github.io/umesh-gangadharaiah/";
const canonicalOrigin = new URL(canonicalUrl).origin;
const basePath = new URL(canonicalUrl).pathname;
const title = "Umesh Gangadharaiah | Backend Engineer";
const description =
  "Portfolio of Umesh Gangadharaiah, a backend engineer focused on distributed systems and infrastructure.";
const socialCardUrl = new URL(
  "assets/social/umesh-gangadharaiah-social-card.png",
  canonicalUrl,
).href;

function parseAttributes(tag) {
  const attributes = new Map();
  const attributeSource = tag
    .replace(/^<[^\s>]+\s*/u, "")
    .replace(/\/?\s*>$/u, "");
  const attributePattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;

  for (const match of attributeSource.matchAll(attributePattern)) {
    attributes.set(
      match[1].toLowerCase(),
      match[2] ?? match[3] ?? match[4] ?? "",
    );
  }

  return attributes;
}

function collectElements(html) {
  return [
    ...html.matchAll(/<([a-z][a-z0-9:-]*)\b[^>]*>/giu),
  ].map((match) => ({
    tagName: match[1].toLowerCase(),
    attributes: parseAttributes(match[0]),
  }));
}

function attributesForTag(elements, tagName) {
  return elements
    .filter((element) => element.tagName === tagName)
    .map((element) => element.attributes);
}

function findUniqueTag(tags, attributeName, attributeValue, label) {
  const matches = tags.filter(
    (attributes) => attributes.get(attributeName) === attributeValue,
  );
  assert.equal(matches.length, 1, `Expected exactly one ${label}.`);
  return matches[0];
}

function assertMetadata(metaTags, selector, expectedContent, label) {
  const [attributeName, attributeValue] = Object.entries(selector)[0];
  const metadata = findUniqueTag(
    metaTags,
    attributeName,
    attributeValue,
    label,
  );
  assert.equal(
    metadata.get("content"),
    expectedContent,
    `${label} must match the approved value.`,
  );
}

function decodeReference(reference, label) {
  let decoded = reference;

  for (let pass = 0; pass < 8; pass += 1) {
    let next;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      assert.fail(`${label} contains malformed percent encoding.`);
    }

    if (next === decoded) return decoded;
    decoded = next;
  }

  assert.fail(`${label} contains excessive nested URL encoding.`);
}

function assertSafeReferenceSyntax(reference, label) {
  assert.equal(typeof reference, "string", `${label} must be a string.`);
  assert.notEqual(reference, "", `${label} must not be empty.`);

  const decodedReference = decodeReference(reference, label);
  assert.equal(
    decodedReference.includes("\0"),
    false,
    `${label} must not contain a NUL byte.`,
  );
  assert.equal(
    decodedReference.includes("\\"),
    false,
    `${label} must use URL path separators.`,
  );
  assert.equal(
    decodedReference.split(/[/?#]/u).includes(".."),
    false,
    `${label} must not contain path traversal.`,
  );
}

function resolveLocalDistPath(reference, label) {
  assertSafeReferenceSyntax(reference, label);

  const parsed = new URL(reference, canonicalUrl);
  assert.equal(
    parsed.origin,
    canonicalOrigin,
    `${label} must use the canonical origin.`,
  );
  assert.equal(
    parsed.search,
    "",
    `${label} must not include a query string.`,
  );
  assert.equal(parsed.hash, "", `${label} must not include a fragment.`);
  assert.ok(
    parsed.pathname.startsWith(basePath),
    `${label} must stay within the GitHub Pages base path.`,
  );

  const encodedRelativePath = parsed.pathname.slice(basePath.length);
  const relativePath = decodeReference(encodedRelativePath, label);

  const fileRelativePath = relativePath === "" ? "index.html" : relativePath;

  const resolvedPath = path.resolve(distRoot, fileRelativePath);
  const relativeToDist = path.relative(distRoot, resolvedPath);
  assert.ok(
    relativeToDist !== "" &&
      relativeToDist !== ".." &&
      !relativeToDist.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativeToDist),
    `${label} resolves outside dist.`,
  );

  return resolvedPath;
}

async function assertRegularDistFile(resolvedPath, label) {
  const relativePath = path.relative(distRoot, resolvedPath);
  const pathSegments = relativePath.split(path.sep);
  let currentPath = distRoot;

  for (const [index, segment] of pathSegments.entries()) {
    currentPath = path.join(currentPath, segment);
    let stats;
    try {
      stats = await lstat(currentPath);
    } catch (error) {
      if (error?.code === "ENOENT") {
        assert.fail(`${label} does not exist in dist.`);
      }
      throw error;
    }

    assert.equal(
      stats.isSymbolicLink(),
      false,
      `${label} must not resolve through a symbolic link.`,
    );
    if (index === pathSegments.length - 1) {
      assert.equal(stats.isFile(), true, `${label} must be a regular file.`);
    } else {
      assert.equal(
        stats.isDirectory(),
        true,
        `${label} has a non-directory parent.`,
      );
    }
  }
}

async function assertLocalFile(reference, label) {
  const resolvedPath = resolveLocalDistPath(reference, label);
  await assertRegularDistFile(resolvedPath, label);
  return resolvedPath;
}

function isCanonicalDocumentLink(element) {
  return (
    element.tagName === "link" &&
    (element.attributes.get("rel") ?? "")
      .toLowerCase()
      .split(/\s+/u)
      .includes("canonical")
  );
}

function localStaticReference(element, attributeName) {
  const reference = element.attributes.get(attributeName);
  if (reference === undefined) return null;
  if (reference.startsWith("#") || reference.startsWith("?")) return null;
  if (attributeName === "href" && isCanonicalDocumentLink(element)) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(reference, canonicalUrl);
  } catch {
    assert.fail(`<${element.tagName}> ${attributeName} must be a valid URL.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }
  if (parsed.origin !== canonicalOrigin) return null;

  assertSafeReferenceSyntax(
    reference,
    `<${element.tagName}> ${attributeName}`,
  );

  return reference;
}

async function verifyLocalHtmlReferences(elements) {
  const checkedReferences = new Set();

  for (const element of elements) {
    for (const attributeName of ["src", "href"]) {
      const reference = localStaticReference(element, attributeName);
      if (reference === null || checkedReferences.has(reference)) continue;

      checkedReferences.add(reference);
      await assertLocalFile(
        reference,
        `<${element.tagName}> ${attributeName} ${reference}`,
      );
    }
  }
}

function assertExactObjectKeys(value, expectedKeys, label) {
  assert.deepEqual(
    Object.keys(value).sort(),
    [...expectedKeys].sort(),
    `${label} contains unexpected or missing fields.`,
  );
}

function readPersonJsonLd(html) {
  const scripts = [
    ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu),
  ].filter((match) => {
    const attributes = parseAttributes(`<script${match[1]}>`);
    return attributes.get("type") === "application/ld+json";
  });

  assert.equal(scripts.length, 1, "Expected exactly one JSON-LD script.");

  let structuredData;
  try {
    structuredData = JSON.parse(scripts[0][2]);
  } catch {
    assert.fail("Person JSON-LD must contain valid JSON.");
  }

  assert.equal(
    structuredData !== null &&
      typeof structuredData === "object" &&
      !Array.isArray(structuredData),
    true,
    "Person JSON-LD must be an object.",
  );
  assertExactObjectKeys(
    structuredData,
    ["@context", "@type", "name", "jobTitle", "url", "sameAs"],
    "Person JSON-LD",
  );
  assert.deepEqual(structuredData, {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Umesh Gangadharaiah",
    jobTitle: "Backend Engineer",
    url: canonicalUrl,
    sameAs: [
      "https://github.com/umeshmg27",
      "https://www.linkedin.com/in/umeshmg/",
    ],
  });
}

async function verifyManifest(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assertExactObjectKeys(
    manifest,
    [
      "name",
      "short_name",
      "start_url",
      "scope",
      "display",
      "background_color",
      "theme_color",
      "icons",
    ],
    "Web app manifest",
  );
  assert.deepEqual(manifest, {
    name: title,
    short_name: "Umesh G.",
    start_url: basePath,
    scope: basePath,
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    icons: [
      {
        src: `${basePath}icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${basePath}icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  });

  return manifest.icons;
}

async function assertPngDimensions(reference, width, height, label) {
  const imagePath = await assertLocalFile(reference, label);
  const metadata = await sharp(imagePath).metadata();
  assert.equal(metadata.format, "png", `${label} must be a PNG.`);
  assert.equal(metadata.width, width, `${label} must be ${width}px wide.`);
  assert.equal(metadata.height, height, `${label} must be ${height}px high.`);
}

function linkByRelationship(linkTags, relationship, label) {
  const matches = linkTags.filter((attributes) =>
    (attributes.get("rel") ?? "")
      .toLowerCase()
      .split(/\s+/u)
      .includes(relationship),
  );
  assert.equal(matches.length, 1, `Expected exactly one ${label}.`);
  return matches[0];
}

async function verifyDistribution() {
  const htmlPath = path.join(distRoot, "index.html");
  const html = await readFile(htmlPath, "utf8");
  const elements = collectElements(html);
  const metaTags = attributesForTag(elements, "meta");
  const linkTags = attributesForTag(elements, "link");

  await verifyLocalHtmlReferences(elements);

  const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/giu)];
  assert.equal(titleMatches.length, 1, "Expected exactly one document title.");
  assert.equal(titleMatches[0][1], title, "Document title is incomplete.");

  assertMetadata(
    metaTags,
    { name: "description" },
    description,
    "meta description",
  );
  assertMetadata(metaTags, { property: "og:type" }, "website", "og:type");
  assertMetadata(metaTags, { property: "og:title" }, title, "og:title");
  assertMetadata(
    metaTags,
    { property: "og:description" },
    description,
    "og:description",
  );
  assertMetadata(
    metaTags,
    { property: "og:url" },
    canonicalUrl,
    "og:url",
  );
  assertMetadata(
    metaTags,
    { property: "og:image" },
    socialCardUrl,
    "og:image",
  );
  assertMetadata(
    metaTags,
    { name: "twitter:card" },
    "summary_large_image",
    "X card type",
  );
  assertMetadata(metaTags, { name: "twitter:title" }, title, "X title");
  assertMetadata(
    metaTags,
    { name: "twitter:description" },
    description,
    "X description",
  );
  assertMetadata(
    metaTags,
    { name: "twitter:url" },
    canonicalUrl,
    "X URL",
  );
  assertMetadata(
    metaTags,
    { name: "twitter:image" },
    socialCardUrl,
    "X image",
  );
  assertMetadata(
    metaTags,
    { name: "theme-color" },
    "#0b1020",
    "theme color",
  );

  const canonicalLink = linkByRelationship(
    linkTags,
    "canonical",
    "canonical link",
  );
  assert.equal(canonicalLink.get("href"), canonicalUrl);

  const manifestLink = linkByRelationship(linkTags, "manifest", "manifest");
  assert.equal(manifestLink.get("href"), `${basePath}site.webmanifest`);
  const manifestPath = await assertLocalFile(
    manifestLink.get("href"),
    "manifest",
  );

  const iconLinks = linkTags.filter(
    (attributes) => attributes.get("rel") === "icon",
  );
  assert.deepEqual(
    iconLinks.map((attributes) => ({
      href: attributes.get("href"),
      sizes: attributes.get("sizes"),
      type: attributes.get("type"),
    })),
    [
      {
        href: `${basePath}icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        href: `${basePath}icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  );
  const appleTouchIcon = linkByRelationship(
    linkTags,
    "apple-touch-icon",
    "Apple touch icon",
  );
  assert.equal(
    appleTouchIcon.get("href"),
    `${basePath}icons/apple-touch-icon.png`,
  );
  assert.equal(appleTouchIcon.get("sizes"), "180x180");

  assert.equal(
    attributesForTag(elements, "div").filter(
      (attributes) => attributes.get("id") === "root",
    ).length,
    1,
    "Expected exactly one #root mount.",
  );
  readPersonJsonLd(html);

  const manifestIcons = await verifyManifest(manifestPath);
  for (const icon of manifestIcons) {
    await assertPngDimensions(
      icon.src,
      Number.parseInt(icon.sizes, 10),
      Number.parseInt(icon.sizes, 10),
      `manifest icon ${icon.sizes}`,
    );
  }
  for (const icon of iconLinks) {
    await assertLocalFile(icon.get("href"), `HTML icon ${icon.get("sizes")}`);
  }
  await assertPngDimensions(
    appleTouchIcon.get("href"),
    180,
    180,
    "Apple touch icon",
  );
  await assertPngDimensions(socialCardUrl, 1200, 630, "social card");

  const robots = await readFile(path.join(distRoot, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*$/mu);
  assert.match(robots, /^Allow: \/$/mu);
  assert.doesNotMatch(robots, /^Disallow:/mu);

  console.log(
    "Verified static metadata, Person JSON-LD, manifest, icons, robots, root mount, and 1200x630 social card.",
  );
}

verifyDistribution().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
