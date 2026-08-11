// @vitest-environment node

import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

type PinnedHttpResponse = {
  location: string | null;
  status: number;
};

type RequestPinned = (
  url: URL,
  options: {
    address: string;
    family: 4 | 6;
    headers: Readonly<Record<string, string>>;
    signal: AbortSignal;
  },
) => Promise<PinnedHttpResponse>;

let requestPinned: RequestPinned | undefined;

beforeAll(async () => {
  const moduleUrl = new URL("./pinned-http-request.mjs", import.meta.url).href;
  const transportModule = (await import(/* @vite-ignore */ moduleUrl)) as {
    requestPinned?: RequestPinned;
  };
  requestPinned = transportModule.requestPinned;
});

afterAll(() => {
  requestPinned = undefined;
});

async function listenOnLoopback(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("temporary server did not expose a TCP address");
  }
  return address.port;
}

async function closeServer(server: Server): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

describe("pinned HTTP request transport", () => {
  it("connects through only the supplied address while retaining GET and Host", async () => {
    let observedHost: string | undefined;
    let observedMethod: string | undefined;
    const server = createServer((request, response) => {
      observedHost = request.headers.host;
      observedMethod = request.method;
      response.writeHead(204, { "x-private-body": "must-not-be-returned" });
      response.end("private response body");
    });
    const port = await listenOnLoopback(server);

    try {
      const url = new URL(`http://cannot-resolve.invalid:${port}/probe`);
      const result = await requestPinned?.(url, {
        address: "127.0.0.1",
        family: 4,
        headers: { accept: "*/*" },
        signal: AbortSignal.timeout(500),
      });

      expect(result).toEqual({ location: null, status: 204 });
      expect(observedMethod).toBe("GET");
      expect(observedHost).toBe(`cannot-resolve.invalid:${port}`);
      expect(result).not.toHaveProperty("body");
    } finally {
      await closeServer(server);
    }
  });

  it("honors the caller's bounded AbortSignal", async () => {
    const server = createServer(() => undefined);
    const port = await listenOnLoopback(server);

    try {
      const url = new URL(`http://cannot-resolve.invalid:${port}/slow`);
      const startedAt = Date.now();
      await expect(
        requestPinned?.(url, {
          address: "127.0.0.1",
          family: 4,
          headers: { accept: "*/*" },
          signal: AbortSignal.timeout(20),
        }),
      ).rejects.toThrow();
      expect(Date.now() - startedAt).toBeLessThan(250);
    } finally {
      await closeServer(server);
    }
  });
});
