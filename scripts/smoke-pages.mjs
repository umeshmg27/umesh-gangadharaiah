import { pathToFileURL } from "node:url";

const canonicalUrl = "https://umeshmg27.github.io/umesh-gangadharaiah/";
const expectedTitle = "Umesh Gangadharaiah | Backend Engineer";
const expectedDescription =
  "Portfolio of Umesh Gangadharaiah, a backend engineer focused on distributed systems and infrastructure.";
const defaultMaxWaitMs = 10 * 60 * 1000;
const defaultRetryIntervalMs = 10 * 1000;
const defaultRequestTimeoutMs = 10 * 1000;
const maximumResponseBytes = 2 * 1024 * 1024;
const maximumRedirects = 5;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

function readBoundedInteger(name, fallback, { minimum, maximum }) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;
  if (!/^\d+$/.test(rawValue)) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }

  const value = Number(rawValue);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value;
}

function getAttribute(tag, name) {
  const expression = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i",
  );
  const match = tag.match(expression);
  return match?.[1] ?? match?.[2] ?? null;
}

function findTagByAttribute(html, tagName, attributeName, expectedValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
  return (
    tags.find(
      (tag) =>
        getAttribute(tag, attributeName)?.toLowerCase() ===
        expectedValue.toLowerCase(),
    ) ?? null
  );
}

function requireAttribute(tag, name, label) {
  const value = tag && getAttribute(tag, name);
  if (!value) throw new Error(`${label} is missing`);
  return value;
}

function requireExact(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} does not match the published contract`);
  }
}

async function readTextWithLimit(response, label) {
  if (!response.body) throw new Error(`${label} returned an empty response`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maximumResponseBytes) {
        throw new Error(`${label} exceeded the ${maximumResponseBytes}-byte limit`);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return body;
  } finally {
    reader.releaseLock();
  }
}

function discardResponseBody(response) {
  if (response.body) void response.body.cancel().catch(() => undefined);
}

async function request(url, label, timeoutMs, includeBody, validateLocation) {
  const requestDeadline = Date.now() + timeoutMs;
  let currentUrl = new URL(url);
  let redirectCount = 0;

  while (true) {
    validateLocation(currentUrl);
    const remainingMs = requestDeadline - Date.now();
    if (remainingMs <= 0) {
      throw new Error(`${label} request timed out after ${timeoutMs}ms`);
    }

    const signal = AbortSignal.timeout(remainingMs);
    let response;
    try {
      response = await fetch(currentUrl, {
        headers: {
          accept: includeBody
            ? "text/html,application/javascript;q=0.9,*/*;q=0.8"
            : "*/*",
          "user-agent": "umesh-gangadharaiah-pages-smoke/1.0",
        },
        redirect: "manual",
        signal,
      });
    } catch {
      if (signal.aborted || Date.now() >= requestDeadline) {
        throw new Error(`${label} request timed out after ${timeoutMs}ms`);
      }
      throw new Error(`${label} request failed`);
    }

    if (redirectStatuses.has(response.status)) {
      const location = response.headers.get("location");
      discardResponseBody(response);
      if (!location) throw new Error(`${label} redirect is missing a location`);

      let redirectUrl;
      try {
        redirectUrl = new URL(location, currentUrl);
      } catch {
        throw new Error(`${label} returned an invalid redirect location`);
      }
      validateLocation(redirectUrl);
      if (redirectCount >= maximumRedirects) {
        throw new Error(`${label} exceeded ${maximumRedirects} redirects`);
      }
      redirectCount += 1;
      currentUrl = redirectUrl;
      continue;
    }

    if (!response.ok) {
      discardResponseBody(response);
      throw new Error(`${label} returned HTTP ${response.status}`);
    }

    validateLocation(new URL(response.url));
    if (!includeBody) {
      discardResponseBody(response);
      return { body: null, finalUrl: response.url };
    }

    try {
      return {
        body: await readTextWithLimit(response, label),
        finalUrl: response.url,
      };
    } catch (error) {
      if (signal.aborted || Date.now() >= requestDeadline) {
        throw new Error(`${label} request timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  }
}

function assertLocalAsset(assetUrl, expectedCanonicalUrl, label) {
  const asset = new URL(assetUrl, expectedCanonicalUrl);
  const canonical = new URL(expectedCanonicalUrl);
  if (
    !["http:", "https:"].includes(asset.protocol) ||
    asset.username !== "" ||
    asset.password !== "" ||
    asset.origin !== canonical.origin ||
    !asset.pathname.startsWith(canonical.pathname)
  ) {
    throw new Error(
      `${label} must stay inside the canonical origin and base path`,
    );
  }
  return asset;
}

function assertPageLocation(pageUrl, expectedCanonicalUrl) {
  const page = new URL(pageUrl);
  const canonical = new URL(expectedCanonicalUrl);
  if (
    !["http:", "https:"].includes(page.protocol) ||
    page.username !== "" ||
    page.password !== "" ||
    page.origin !== canonical.origin
  ) {
    throw new Error("Published page must stay on the canonical origin");
  }
  return page;
}

function assertSectionHashContract(bundle) {
  for (const section of ["projects", "blog", "contact"]) {
    const linkPattern = new RegExp(
      `href\\s*:\\s*["'\`]#${section}["'\`]`,
    );
    const targetPattern = new RegExp(
      `id\\s*:\\s*["'\`]${section}["'\`]`,
    );
    if (!linkPattern.test(bundle) || !targetPattern.test(bundle)) {
      throw new Error(`#${section} link and section target contract is missing`);
    }
  }
}

async function validatePublishedSite(config, deadlineAt) {
  const remainingTimeout = () => {
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) throw new Error("smoke wait budget expired");
    return Math.min(config.requestTimeoutMs, remainingMs);
  };

  const page = await request(
    config.siteUrl,
    "Published page",
    remainingTimeout(),
    true,
    (location) => assertPageLocation(location, config.expectedCanonicalUrl),
  );
  if (page.finalUrl !== new URL(config.expectedCanonicalUrl).href) {
    throw new Error(
      "Published page did not resolve to the expected canonical URL",
    );
  }
  const html = page.body;

  const title = html.match(/<title(?:\s[^>]*)?>([^<]*)<\/title>/i)?.[1]?.trim();
  requireExact(title, expectedTitle, "Page title");

  const canonicalTag = findTagByAttribute(html, "link", "rel", "canonical");
  requireExact(
    requireAttribute(canonicalTag, "href", "Canonical URL"),
    config.expectedCanonicalUrl,
    "Canonical URL",
  );

  const expectedOpenGraph = {
    "og:type": "website",
    "og:title": expectedTitle,
    "og:description": expectedDescription,
    "og:url": config.expectedCanonicalUrl,
    "og:image": new URL(
      "assets/social/umesh-gangadharaiah-social-card.png",
      config.expectedCanonicalUrl,
    ).href,
  };
  for (const [property, expected] of Object.entries(expectedOpenGraph)) {
    const tag = findTagByAttribute(html, "meta", "property", property);
    requireExact(
      requireAttribute(tag, "content", `${property} content`),
      expected,
      property,
    );
  }

  const rootTag = findTagByAttribute(html, "div", "id", "root");
  if (!rootTag) throw new Error("Application root #root is missing");

  const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
  const hashedScriptTags = scriptTags.filter((tag) => {
    const source = getAttribute(tag, "src");
    return source && /(?:^|\/)[^/?#]+-[A-Za-z0-9_-]{6,}\.js(?:[?#].*)?$/.test(source);
  });
  if (hashedScriptTags.length !== 1) {
    throw new Error(
      `Expected exactly one hashed JavaScript bundle, found ${hashedScriptTags.length}`,
    );
  }
  const scriptSource = requireAttribute(
    hashedScriptTags[0],
    "src",
    "Hashed JavaScript bundle",
  );
  const scriptUrl = assertLocalAsset(
    new URL(scriptSource, page.finalUrl).href,
    config.expectedCanonicalUrl,
    "Hashed JavaScript bundle",
  );
  const bundle = await request(
    scriptUrl,
    "Hashed JavaScript bundle",
    remainingTimeout(),
    true,
    (location) =>
      assertLocalAsset(
        location,
        config.expectedCanonicalUrl,
        "Hashed JavaScript bundle",
      ),
  );
  assertSectionHashContract(bundle.body);

  const imageUrl = assertLocalAsset(
    expectedOpenGraph["og:image"],
    config.expectedCanonicalUrl,
    "Open Graph image",
  );
  await request(
    imageUrl,
    "Open Graph image",
    remainingTimeout(),
    false,
    (location) =>
      assertLocalAsset(location, config.expectedCanonicalUrl, "Open Graph image"),
  );

  return { finalUrl: page.finalUrl };
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function smokePublishedSite(options = {}) {
  const config = {
    siteUrl: options.siteUrl ?? canonicalUrl,
    expectedCanonicalUrl: options.expectedCanonicalUrl ?? canonicalUrl,
    maxWaitMs: options.maxWaitMs ?? defaultMaxWaitMs,
    retryIntervalMs: options.retryIntervalMs ?? defaultRetryIntervalMs,
    requestTimeoutMs: options.requestTimeoutMs ?? defaultRequestTimeoutMs,
    maxAttempts: options.maxAttempts ?? Number.POSITIVE_INFINITY,
  };
  const deadlineAt = Date.now() + config.maxWaitMs;
  let attempts = 0;
  let lastError = new Error("smoke did not run");

  while (attempts < config.maxAttempts && Date.now() < deadlineAt) {
    attempts += 1;
    try {
      const result = await validatePublishedSite(config, deadlineAt);
      return { ...result, attempts };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("unknown smoke failure");
    }

    if (attempts >= config.maxAttempts || Date.now() >= deadlineAt) break;
    const waitMs = Math.min(config.retryIntervalMs, deadlineAt - Date.now());
    if (waitMs > 0) await delay(waitMs);
  }

  const attemptLabel = attempts === 1 ? "attempt" : "attempts";
  throw new Error(
    `Published-site smoke failed after ${attempts} ${attemptLabel}: ${lastError.message}`,
  );
}

function optionsFromEnvironment() {
  return {
    siteUrl: process.env.PORTFOLIO_SMOKE_URL || canonicalUrl,
    expectedCanonicalUrl:
      process.env.PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL || canonicalUrl,
    maxWaitMs: readBoundedInteger(
      "PORTFOLIO_SMOKE_MAX_WAIT_MS",
      defaultMaxWaitMs,
      { minimum: 1, maximum: defaultMaxWaitMs },
    ),
    retryIntervalMs: readBoundedInteger(
      "PORTFOLIO_SMOKE_RETRY_INTERVAL_MS",
      defaultRetryIntervalMs,
      { minimum: 0, maximum: 60 * 1000 },
    ),
    requestTimeoutMs: readBoundedInteger(
      "PORTFOLIO_SMOKE_REQUEST_TIMEOUT_MS",
      defaultRequestTimeoutMs,
      { minimum: 1, maximum: 30 * 1000 },
    ),
    maxAttempts: readBoundedInteger(
      "PORTFOLIO_SMOKE_MAX_ATTEMPTS",
      Number.POSITIVE_INFINITY,
      { minimum: 1, maximum: 1000 },
    ),
  };
}

async function main() {
  try {
    const result = await smokePublishedSite(optionsFromEnvironment());
    const attemptLabel = result.attempts === 1 ? "attempt" : "attempts";
    console.log(
      `Published-site smoke passed after ${result.attempts} ${attemptLabel}: ${result.finalUrl}`,
    );
    console.log("Validated section hash contract: #projects, #blog, #contact");
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown smoke failure";
    console.error(message);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
