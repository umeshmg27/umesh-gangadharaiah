// @vitest-environment node

import { spawn } from "node:child_process";
import { createServer, type RequestListener, type Server } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const smokeScript = path.join(repositoryRoot, "scripts/smoke-pages.mjs");
const pagePath = "/umesh-gangadharaiah/";
const scriptPath = `${pagePath}assets/index-AbC123xy.js`;
const imagePath = `${pagePath}assets/social/umesh-gangadharaiah-social-card.png`;

type RunningFixture = {
  baseUrl: string;
  close: () => Promise<void>;
};

type SmokeResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

const openServers = new Set<Server>();

function validHtml(canonicalUrl: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <title>Umesh Gangadharaiah | Backend Engineer</title>
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Umesh Gangadharaiah | Backend Engineer">
    <meta property="og:description" content="Portfolio of Umesh Gangadharaiah, a backend engineer focused on distributed systems and infrastructure.">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${new URL(imagePath, canonicalUrl)}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${scriptPath}"></script>
  </body>
</html>`;
}

async function startFixture(
  handler: RequestListener,
): Promise<RunningFixture> {
  const server = createServer(handler);
  openServers.add(server);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Fixture did not bind a TCP port");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      openServers.delete(server);
    },
  };
}

async function runSmoke(environment: Record<string, string>): Promise<SmokeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [smokeScript], {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        NO_COLOR: "1",
        PORTFOLIO_SMOKE_MAX_WAIT_MS: "1000",
        PORTFOLIO_SMOKE_RETRY_INTERVAL_MS: "5",
        PORTFOLIO_SMOKE_REQUEST_TIMEOUT_MS: "250",
        ...environment,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (status) => resolve({ status, stdout, stderr }));
  });
}

afterEach(async () => {
  await Promise.all(
    [...openServers].map(async (server) => {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      openServers.delete(server);
    }),
  );
});

describe("published Pages smoke", () => {
  it("accepts a redirected page with metadata, local assets, and section hashes", async () => {
    let baseUrl = "";
    const fixture = await startFixture((request, response) => {
      if (request.url === "/portfolio") {
        response.writeHead(302, { location: pagePath }).end();
        return;
      }
      if (request.url === pagePath) {
        response
          .writeHead(200, { "content-type": "text/html; charset=utf-8" })
          .end(validHtml(`${baseUrl}${pagePath}`));
        return;
      }
      if (request.url === scriptPath) {
        response
          .writeHead(200, { "content-type": "text/javascript" })
          .end(
            'const links=[{href:"#projects"},{href:"#contact"}];const sections=[{id:"projects"},{id:"contact"}];',
          );
        return;
      }
      if (request.url === imagePath) {
        response.writeHead(200, { "content-type": "image/png" }).end("png");
        return;
      }
      response.writeHead(404).end();
    });
    baseUrl = fixture.baseUrl;

    const result = await runSmoke({
      PORTFOLIO_SMOKE_URL: `${baseUrl}/portfolio`,
      PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_MAX_ATTEMPTS: "1",
    });
    await fixture.close();

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Published-site smoke passed after 1 attempt");
    expect(result.stdout).toContain(`${baseUrl}${pagePath}`);
    expect(result.stdout).toContain("section hash contract: #projects, #contact");
    expect(result.stderr).toBe("");
  });

  it("retries a transient page failure and then validates the complete site", async () => {
    let pageAttempts = 0;
    let baseUrl = "";
    const fixture = await startFixture((request, response) => {
      if (request.url === pagePath) {
        pageAttempts += 1;
        if (pageAttempts === 1) {
          response.writeHead(503).end("temporary upstream failure");
          return;
        }
        response
          .writeHead(200, { "content-type": "text/html" })
          .end(validHtml(`${baseUrl}${pagePath}`));
        return;
      }
      if (request.url === scriptPath) {
        response
          .writeHead(200, { "content-type": "text/javascript" })
          .end(
            'const nav=[{href:"#projects"},{href:"#contact"}];const targets=[{id:"projects"},{id:"contact"}];',
          );
        return;
      }
      if (request.url === imagePath) {
        response.writeHead(200, { "content-type": "image/png" }).end("png");
        return;
      }
      response.writeHead(404).end();
    });
    baseUrl = fixture.baseUrl;

    const result = await runSmoke({
      PORTFOLIO_SMOKE_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_MAX_ATTEMPTS: "3",
    });
    await fixture.close();

    expect(result.status, result.stderr).toBe(0);
    expect(pageAttempts).toBe(2);
    expect(result.stdout).toContain("Published-site smoke passed after 2 attempts");
    expect(result.stderr).toBe("");
  });

  it("rejects a page with more than one hashed entry script", async () => {
    let baseUrl = "";
    const fixture = await startFixture((request, response) => {
      if (request.url === pagePath) {
        const htmlWithDuplicateEntry = validHtml(`${baseUrl}${pagePath}`).replace(
          "</body>",
          `<script type="module" src="${pagePath}assets/other-XyZ987ab.js"></script></body>`,
        );
        response
          .writeHead(200, { "content-type": "text/html" })
          .end(htmlWithDuplicateEntry);
        return;
      }
      if (request.url === scriptPath) {
        response
          .writeHead(200, { "content-type": "text/javascript" })
          .end(
            'const nav=[{href:"#projects"},{href:"#contact"}];const targets=[{id:"projects"},{id:"contact"}];',
          );
        return;
      }
      if (request.url === imagePath) {
        response.writeHead(200, { "content-type": "image/png" }).end("png");
        return;
      }
      response.writeHead(404).end();
    });
    baseUrl = fixture.baseUrl;

    const result = await runSmoke({
      PORTFOLIO_SMOKE_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_MAX_ATTEMPTS: "1",
    });
    await fixture.close();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Expected exactly one hashed JavaScript bundle, found 2",
    );
    expect(result.stdout).toBe("");
  });

  it.each([
    {
      assetLabel: "Hashed JavaScript bundle",
      assetPath: scriptPath,
      redirectedPath: "/redirected-entry.js",
      contentType: "text/javascript",
      responseBody:
        'const nav=[{href:"#projects"},{href:"#contact"}];const targets=[{id:"projects"},{id:"contact"}];',
    },
    {
      assetLabel: "Open Graph image",
      assetPath: imagePath,
      redirectedPath: "/redirected-social-card.png",
      contentType: "image/png",
      responseBody: "png",
    },
  ])(
    "rejects an off-origin redirect from the $assetLabel",
    async ({
      assetLabel,
      assetPath,
      redirectedPath,
      contentType,
      responseBody,
    }) => {
      const secondOrigin = await startFixture((request, response) => {
        if (request.url === redirectedPath) {
          response.writeHead(200, { "content-type": contentType }).end(responseBody);
          return;
        }
        response.writeHead(404).end();
      });

      let baseUrl = "";
      const canonicalOrigin = await startFixture((request, response) => {
        if (request.url === pagePath) {
          response
            .writeHead(200, { "content-type": "text/html" })
            .end(validHtml(`${baseUrl}${pagePath}`));
          return;
        }
        if (request.url === assetPath) {
          response
            .writeHead(302, {
              location: `${secondOrigin.baseUrl}${redirectedPath}`,
            })
            .end();
          return;
        }
        if (request.url === scriptPath) {
          response
            .writeHead(200, { "content-type": "text/javascript" })
            .end(
              'const nav=[{href:"#projects"},{href:"#contact"}];const targets=[{id:"projects"},{id:"contact"}];',
            );
          return;
        }
        if (request.url === imagePath) {
          response.writeHead(200, { "content-type": "image/png" }).end("png");
          return;
        }
        response.writeHead(404).end();
      });
      baseUrl = canonicalOrigin.baseUrl;

      const result = await runSmoke({
        PORTFOLIO_SMOKE_URL: `${baseUrl}${pagePath}`,
        PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${baseUrl}${pagePath}`,
        PORTFOLIO_SMOKE_MAX_ATTEMPTS: "1",
      });
      await canonicalOrigin.close();
      await secondOrigin.close();

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        `${assetLabel} must stay inside the canonical origin and base path`,
      );
      expect(result.stdout).toBe("");
    },
  );

  it("rejects a page redirect that does not finish at the canonical URL", async () => {
    let baseUrl = "";
    const unexpectedPagePath = `${pagePath}unexpected/`;
    const fixture = await startFixture((request, response) => {
      if (request.url === "/portfolio") {
        response.writeHead(302, { location: unexpectedPagePath }).end();
        return;
      }
      if (request.url === unexpectedPagePath) {
        response
          .writeHead(200, { "content-type": "text/html" })
          .end(validHtml(`${baseUrl}${pagePath}`));
        return;
      }
      if (request.url === scriptPath) {
        response
          .writeHead(200, { "content-type": "text/javascript" })
          .end(
            'const nav=[{href:"#projects"},{href:"#contact"}];const targets=[{id:"projects"},{id:"contact"}];',
          );
        return;
      }
      if (request.url === imagePath) {
        response.writeHead(200, { "content-type": "image/png" }).end("png");
        return;
      }
      response.writeHead(404).end();
    });
    baseUrl = fixture.baseUrl;

    const result = await runSmoke({
      PORTFOLIO_SMOKE_URL: `${baseUrl}/portfolio`,
      PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_MAX_ATTEMPTS: "1",
    });
    await fixture.close();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Published page did not resolve to the expected canonical URL",
    );
    expect(result.stdout).toBe("");
  });

  it("rejects an asset that exceeds five same-origin redirects", async () => {
    let baseUrl = "";
    const redirectPaths = [
      scriptPath,
      ...Array.from(
        { length: 6 },
        (_, index) => `${pagePath}assets/redirect-${index + 1}.js`,
      ),
    ];
    const fixture = await startFixture((request, response) => {
      if (request.url === pagePath) {
        response
          .writeHead(200, { "content-type": "text/html" })
          .end(validHtml(`${baseUrl}${pagePath}`));
        return;
      }
      const redirectIndex = redirectPaths.indexOf(request.url ?? "");
      if (redirectIndex >= 0 && redirectIndex < redirectPaths.length - 1) {
        response
          .writeHead(302, { location: redirectPaths[redirectIndex + 1] })
          .end();
        return;
      }
      if (request.url === redirectPaths.at(-1)) {
        response
          .writeHead(200, { "content-type": "text/javascript" })
          .end(
            'const nav=[{href:"#projects"},{href:"#contact"}];const targets=[{id:"projects"},{id:"contact"}];',
          );
        return;
      }
      if (request.url === imagePath) {
        response.writeHead(200, { "content-type": "image/png" }).end("png");
        return;
      }
      response.writeHead(404).end();
    });
    baseUrl = fixture.baseUrl;

    const result = await runSmoke({
      PORTFOLIO_SMOKE_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_MAX_ATTEMPTS: "1",
    });
    await fixture.close();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Hashed JavaScript bundle exceeded 5 redirects",
    );
    expect(result.stdout).toBe("");
  });

  it("stops deterministically when a request exhausts its timeout budget", async () => {
    const fixture = await startFixture((_request, response) => {
      setTimeout(() => {
        response.writeHead(200, { "content-type": "text/html" });
        response.end("private response body that must stay redacted");
      }, 250);
    });

    const startedAt = Date.now();
    const result = await runSmoke({
      PORTFOLIO_SMOKE_URL: `${fixture.baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_EXPECTED_CANONICAL_URL: `${fixture.baseUrl}${pagePath}`,
      PORTFOLIO_SMOKE_MAX_ATTEMPTS: "1",
      PORTFOLIO_SMOKE_REQUEST_TIMEOUT_MS: "25",
    });
    const elapsedMs = Date.now() - startedAt;
    await fixture.close();

    expect(result.status).toBe(1);
    expect(elapsedMs).toBeLessThan(1_000);
    expect(result.stderr).toContain("Published-site smoke failed after 1 attempt");
    expect(result.stderr).toContain("request timed out after 25ms");
    expect(result.stderr).not.toContain("private response body");
    expect(result.stdout).toBe("");
  });
});
