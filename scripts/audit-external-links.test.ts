// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

type AuditTarget = {
  label: string;
  url: string;
};

type PinnedRequestOptions = {
  address: string;
  family: 4 | 6;
  headers: Readonly<Record<string, string>>;
  signal: AbortSignal;
};

type PinnedHttpResponse = {
  location: string | null;
  status: number;
};

type RequestPinned = (
  url: URL,
  options: PinnedRequestOptions,
) => Promise<PinnedHttpResponse>;

type AuditOptions = {
  targets: readonly AuditTarget[];
  timeoutMs: number;
  requestPinnedImpl: RequestPinned;
  resolveAddresses: (hostname: string) => Promise<readonly string[]>;
  writeLine: (line: string) => void;
};

type AuditExternalTargets = (options: AuditOptions) => Promise<void>;

let auditExternalTargets: AuditExternalTargets | undefined;
let wroteDuringImport = false;

beforeAll(async () => {
  const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
  try {
    const auditModuleUrl = new URL(
      "./audit-external-links.mjs",
      import.meta.url,
    ).href;
    const auditModule = (await import(/* @vite-ignore */ auditModuleUrl)) as {
      auditExternalTargets?: AuditExternalTargets;
    };
    auditExternalTargets = auditModule.auditExternalTargets;
    wroteDuringImport = consoleLog.mock.calls.length > 0;
  } finally {
    consoleLog.mockRestore();
  }
});

afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("external-link audit", () => {
  it("provides an isolated audit seam without running the live CLI", () => {
    expect(auditExternalTargets).toBeTypeOf("function");
    expect(wroteDuringImport).toBe(false);
  });

  it("can be imported when process argv has no entrypoint", async () => {
    const originalEntrypoint = process.argv[1];
    Reflect.deleteProperty(process.argv, "1");

    try {
      const moduleUrl = new URL(
        `./audit-external-links.mjs?missing-entrypoint=${Date.now()}`,
        import.meta.url,
      ).href;
      const importedModule = await import(/* @vite-ignore */ moduleUrl);
      expect(importedModule.auditExternalTargets).toBeTypeOf("function");
    } finally {
      process.argv[1] = originalEntrypoint;
    }
  });

  it.each([
    "http://127.0.0.1/admin",
    "http://10.0.0.1/admin",
    "http://169.254.169.254/metadata",
    "http://192.0.2.1/reserved",
    "http://[::1]/admin",
    "http://[fe80::1]/admin",
    "http://[fc00::1]/admin",
    "http://[2001:100::1]/reserved",
    "http://[2001:db8::1]/reserved",
    "http://[3ffe::1]/reserved",
    "http://localhost/admin",
    "file:///etc/passwd",
    "https://user:secret@example.com/",
  ])("rejects unsafe direct destination %s before request", async (url) => {
    const requestPinnedImpl = vi.fn(async () => ({
      location: null,
      status: 204,
    }));
    const lines: string[] = [];

    await auditExternalTargets?.({
      targets: [{ label: "Unsafe target", url }],
      timeoutMs: 100,
      requestPinnedImpl,
      resolveAddresses: async () => ["93.184.216.34"],
      writeLine: (line) => lines.push(line),
    });

    expect(requestPinnedImpl).not.toHaveBeenCalled();
    expect(lines).toEqual(["Unsafe target: unavailable (unsafe destination)"]);
    expect(lines.join(" ")).not.toContain("secret");
  });

  it.each([
    [["10.1.2.3"]],
    [["100.64.0.1"]],
    [["169.254.1.1"]],
    [["172.31.255.255"]],
    [["192.168.1.1"]],
    [["198.18.0.1"]],
    [["203.0.113.9"]],
    [["224.0.0.1"]],
    [["255.255.255.255"]],
    [["::"]],
    [["::ffff:127.0.0.1"]],
    [["fe80::1"]],
    [["fd00::1"]],
    [["ff02::1"]],
    [["2001:db8::1"]],
    [["3fff::1"]],
    [["93.184.216.34", "127.0.0.1"]],
  ])(
    "rejects unsafe DNS answers %j before request",
    async (resolvedAddresses) => {
      const requestPinnedImpl = vi.fn(async () => ({
        location: null,
        status: 204,
      }));
      const resolveAddresses = vi.fn(async () => resolvedAddresses);
      const lines: string[] = [];

      await auditExternalTargets?.({
        targets: [{ label: "Resolved target", url: "https://public.example/" }],
        timeoutMs: 100,
        requestPinnedImpl,
        resolveAddresses,
        writeLine: (line) => lines.push(line),
      });

      expect(resolveAddresses).toHaveBeenCalledWith("public.example");
      expect(requestPinnedImpl).not.toHaveBeenCalled();
      expect(lines).toEqual([
        "Resolved target: unavailable (unsafe destination)",
      ]);
    },
  );

  it("rejects a public redirect to a loopback literal before the second request", async () => {
    const requestPinnedImpl = vi.fn(async () =>
      ({
        location: "http://127.0.0.1/admin",
        status: 302,
      }),
    );
    const resolveAddresses = vi.fn(async () => ["93.184.216.34"]);
    const lines: string[] = [];

    await auditExternalTargets?.({
      targets: [{ label: "Redirect target", url: "https://public.example/start" }],
      timeoutMs: 100,
      requestPinnedImpl,
      resolveAddresses,
      writeLine: (line) => lines.push(line),
    });

    expect(requestPinnedImpl).toHaveBeenCalledTimes(1);
    expect(resolveAddresses).toHaveBeenCalledTimes(1);
    expect(lines).toEqual([
      "Redirect target: unavailable (unsafe destination)",
    ]);
  });

  it("rejects a redirect whose hostname resolves to a private address", async () => {
    const requestPinnedImpl = vi.fn(async () =>
      ({
        location: "https://internal.example/admin",
        status: 302,
      }),
    );
    const resolveAddresses = vi.fn(async (hostname: string) =>
      hostname === "public.example" ? ["93.184.216.34"] : ["10.0.0.7"],
    );
    const lines: string[] = [];

    await auditExternalTargets?.({
      targets: [{ label: "Redirect target", url: "https://public.example/start" }],
      timeoutMs: 100,
      requestPinnedImpl,
      resolveAddresses,
      writeLine: (line) => lines.push(line),
    });

    expect(requestPinnedImpl).toHaveBeenCalledTimes(1);
    expect(resolveAddresses).toHaveBeenNthCalledWith(1, "public.example");
    expect(resolveAddresses).toHaveBeenNthCalledWith(2, "internal.example");
    expect(lines).toEqual([
      "Redirect target: unavailable (unsafe destination)",
    ]);
  });

  it("follows a public redirect and reports only its final URL", async () => {
    const requestPinnedImpl = vi.fn(async (currentUrl: URL) => {
      if (currentUrl.hostname === "public.example") {
        return {
          location: "https://cdn.example/final",
          status: 302,
        };
      }
      return { location: null, status: 204 };
    });
    const resolveAddresses = vi.fn(async () => ["93.184.216.34"]);
    const lines: string[] = [];

    await auditExternalTargets?.({
      targets: [{ label: "Public target", url: "https://public.example/start" }],
      timeoutMs: 100,
      requestPinnedImpl,
      resolveAddresses,
      writeLine: (line) => lines.push(line),
    });

    expect(requestPinnedImpl).toHaveBeenCalledTimes(2);
    expect(resolveAddresses).toHaveBeenNthCalledWith(1, "public.example");
    expect(resolveAddresses).toHaveBeenNthCalledWith(2, "cdn.example");
    expect(lines).toEqual([
      "Public target: HTTP 204 -> https://cdn.example/final",
    ]);
  });

  it("pins a validated address instead of allowing connection DNS to rebind", async () => {
    const fetchImpl = vi.fn(async () => {
      // This simulates an ordinary fetch resolving the hostname again after the
      // public preflight answer and connecting to a rebound loopback address.
      const independentlyResolvedAddress = "127.0.0.1";
      return new Response(null, {
        headers: { "x-connected-address": independentlyResolvedAddress },
        status: 204,
      });
    });
    const requestPinnedImpl = vi.fn(async (_url: URL, options) => {
      expect(options.address).toBe("93.184.216.34");
      expect(options.family).toBe(4);
      return { location: null, status: 204 };
    });
    const lines: string[] = [];

    const auditOptions = {
      targets: [
        { label: "Rebinding target", url: "https://public.example/start" },
      ],
      timeoutMs: 100,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      requestPinnedImpl,
      resolveAddresses: async () => ["93.184.216.34"],
      writeLine: (line) => lines.push(line),
    } satisfies AuditOptions & { fetchImpl: typeof fetch };
    await auditExternalTargets?.(auditOptions);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(requestPinnedImpl).toHaveBeenCalledTimes(1);
    expect(lines).toEqual(["Rebinding target: HTTP 204"]);
  });

  it("stops after five public redirects", async () => {
    const requestPinnedImpl = vi.fn(async (currentUrl: URL) => {
      const hop = Number(currentUrl.pathname.split("-").at(-1));
      return {
        location: `/hop-${hop + 1}`,
        status: 302,
      };
    });
    const resolveAddresses = vi.fn(async () => ["93.184.216.34"]);
    const lines: string[] = [];

    await auditExternalTargets?.({
      targets: [{ label: "Redirect loop", url: "https://public.example/hop-0" }],
      timeoutMs: 100,
      requestPinnedImpl,
      resolveAddresses,
      writeLine: (line) => lines.push(line),
    });

    expect(requestPinnedImpl).toHaveBeenCalledTimes(6);
    expect(resolveAddresses).toHaveBeenCalledTimes(6);
    expect(lines).toEqual([
      "Redirect loop: unavailable (redirect limit exceeded)",
    ]);
  });

  it("contains a malformed third-party URL as a redacted audit failure", async () => {
    const requestPinnedImpl = vi.fn(async () => ({
      location: null,
      status: 200,
    }));
    const lines: string[] = [];

    await expect(
      auditExternalTargets?.({
        targets: [{ label: "Malformed target", url: "not a URL" }],
        timeoutMs: 100,
        requestPinnedImpl,
        resolveAddresses: async () => ["93.184.216.34"],
        writeLine: (line) => lines.push(line),
      }),
    ).resolves.toBeUndefined();

    expect(requestPinnedImpl).not.toHaveBeenCalled();
    expect(lines).toEqual([
      "Malformed target: unavailable (unsafe destination)",
    ]);
    expect(lines.join(" ")).not.toContain("private response body");
  });

  it("enforces the total timeout when an injected transport ignores its signal", async () => {
    const requestPinnedImpl = vi.fn(
      async () =>
        new Promise<PinnedHttpResponse>((resolve) => {
          setTimeout(() => resolve({ location: null, status: 204 }), 200);
        }),
    );
    const lines: string[] = [];
    const startedAt = Date.now();

    await auditExternalTargets?.({
      targets: [{ label: "Slow target", url: "https://public.example/" }],
      timeoutMs: 20,
      requestPinnedImpl,
      resolveAddresses: async () => ["93.184.216.34"],
      writeLine: (line) => lines.push(line),
    });

    expect(Date.now() - startedAt).toBeLessThan(150);
    expect(lines).toEqual(["Slow target: unavailable (timeout after 20ms)"]);
  });

  it("continues after DNS, transport, and HTTP failures without exposing bodies", async () => {
    const requestPinnedImpl = vi.fn(async (currentUrl: URL) => {
      const hostname = currentUrl.hostname;
      if (hostname === "transport-failure.example") {
        throw new Error("private transport response body");
      }
      return { location: null, status: 503 };
    });
    const resolveAddresses = vi.fn(async (hostname: string) => {
      if (hostname === "dns-failure.example") {
        throw new Error("private DNS response body");
      }
      return ["93.184.216.34"];
    });
    const lines: string[] = [];

    await expect(
      auditExternalTargets?.({
        targets: [
          { label: "DNS failure", url: "https://dns-failure.example/" },
          {
            label: "Transport failure",
            url: "https://transport-failure.example/",
          },
          { label: "HTTP failure", url: "https://http-failure.example/" },
        ],
        timeoutMs: 100,
        requestPinnedImpl,
        resolveAddresses,
        writeLine: (line) => lines.push(line),
      }),
    ).resolves.toBeUndefined();

    expect(lines).toEqual([
      "DNS failure: unavailable (request failed)",
      "Transport failure: unavailable (request failed)",
      "HTTP failure: HTTP 503",
    ]);
    expect(lines.join(" ")).not.toContain("private");
  });
});
