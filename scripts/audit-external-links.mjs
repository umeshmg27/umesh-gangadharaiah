import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { pathToFileURL } from "node:url";

import { requestPinned } from "./pinned-http-request.mjs";

const targets = [
  { label: "GitHub", url: "https://github.com/umeshmg27" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/umeshmg/" },
  {
    label: "Publication 7086",
    url: "https://www.tdcommons.org/dpubs_series/7086/",
  },
  {
    label: "Publication 7085",
    url: "https://www.tdcommons.org/dpubs_series/7085/",
  },
  {
    label: "Telegram as Data Storage",
    url: "https://github.com/umeshmg27/Telegram-as-Data-Storage",
  },
  {
    label: "Cisco Multi-Site Orchestrator image",
    url: "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png",
  },
  {
    label: "Cisco Application Centric Infrastructure image",
    url: "https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/white-paper-c11-743107.docx/_jcr_content/renditions/white-paper-c11-743107_11.png",
  },
];

const defaultTimeoutMs = 8_000;
const maximumTimeoutMs = 30_000;
const maximumRedirects = 5;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

class UnsafeDestinationError extends Error {}
class RedirectLimitError extends Error {}

const unsafeIpv4Ranges = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function ipv4ToInteger(address) {
  return address
    .split(".")
    .reduce((value, octet) => (value << 8n) | BigInt(Number(octet)), 0n);
}

function isInIpv4Range(address, network, prefixLength) {
  const shift = BigInt(32 - prefixLength);
  return ipv4ToInteger(address) >> shift === ipv4ToInteger(network) >> shift;
}

function ipv6ToInteger(address) {
  const unwrapped = address.replace(/^\[|\]$/g, "").toLowerCase();
  if (unwrapped.includes("%")) return null;

  let normalized = unwrapped;
  const finalSeparator = normalized.lastIndexOf(":");
  const ipv4Suffix = normalized.slice(finalSeparator + 1);
  if (ipv4Suffix.includes(".")) {
    if (isIP(ipv4Suffix) !== 4) return null;
    const ipv4 = ipv4ToInteger(ipv4Suffix);
    normalized = `${normalized.slice(0, finalSeparator)}:${(
      ipv4 >> 16n
    ).toString(16)}:${(ipv4 & 0xffffn).toString(16)}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const groups = [...left, ...Array(missing).fill("0"), ...right];
  if (groups.length !== 8) return null;

  return groups.reduce(
    (value, group) => (value << 16n) | BigInt(`0x${group || "0"}`),
    0n,
  );
}

function isInIpv6Range(address, network, prefixLength) {
  const value = ipv6ToInteger(address);
  const networkValue = ipv6ToInteger(network);
  if (value === null || networkValue === null) return false;
  const shift = BigInt(128 - prefixLength);
  return value >> shift === networkValue >> shift;
}

function isUnsafeIpAddress(address) {
  const unwrapped = address.replace(/^\[|\]$/g, "");
  const version = isIP(unwrapped);
  if (version === 4) {
    return unsafeIpv4Ranges.some(([network, prefixLength]) =>
      isInIpv4Range(unwrapped, network, prefixLength),
    );
  }
  if (version !== 6) return true;

  const value = ipv6ToInteger(unwrapped);
  if (value === null || value >> 125n !== 1n) return true;
  return [
    ["2001::", 23],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["3ffe::", 16],
    ["3fff::", 20],
  ].some(([network, prefixLength]) =>
    isInIpv6Range(unwrapped, network, prefixLength),
  );
}

async function assertSafeDestination(destination, resolveAddresses) {
  const url = new URL(destination);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username !== "" ||
    url.password !== ""
  ) {
    throw new UnsafeDestinationError("unsafe destination");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new UnsafeDestinationError("unsafe destination");
  }

  const literalFamily = isIP(hostname);
  if (literalFamily !== 0) {
    if (isUnsafeIpAddress(hostname)) {
      throw new UnsafeDestinationError("unsafe destination");
    }
    return { address: hostname, family: literalFamily, url };
  }

  const addresses = await resolveAddresses(hostname);
  if (
    addresses.length === 0 ||
    addresses.some((address) => isUnsafeIpAddress(address))
  ) {
    throw new UnsafeDestinationError("unsafe destination");
  }
  const address = addresses[0];
  return { address, family: isIP(address), url };
}

async function waitWithinSignal(operation, signal) {
  if (signal.aborted) throw signal.reason;

  let removeAbortListener = () => undefined;
  const aborted = new Promise((_, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    removeAbortListener = () => signal.removeEventListener("abort", onAbort);
  });

  try {
    return await Promise.race([operation, aborted]);
  } finally {
    removeAbortListener();
  }
}

function auditTimeoutMs() {
  const rawValue = process.env.PORTFOLIO_AUDIT_TIMEOUT_MS;
  if (rawValue === undefined || rawValue === "") return defaultTimeoutMs;
  if (!/^\d+$/.test(rawValue)) {
    throw new Error(
      `PORTFOLIO_AUDIT_TIMEOUT_MS must be an integer from 1 to ${maximumTimeoutMs}`,
    );
  }

  const value = Number(rawValue);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximumTimeoutMs) {
    throw new Error(
      `PORTFOLIO_AUDIT_TIMEOUT_MS must be an integer from 1 to ${maximumTimeoutMs}`,
    );
  }
  return value;
}

async function auditTarget(
  target,
  timeoutMs,
  requestPinnedImpl,
  resolveAddresses,
  writeLine,
) {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    let initialUrl;
    try {
      initialUrl = new URL(target.url);
    } catch {
      throw new UnsafeDestinationError("unsafe destination");
    }
    let currentUrl = initialUrl;
    let redirectCount = 0;

    while (true) {
      const destination = await waitWithinSignal(
        assertSafeDestination(currentUrl, resolveAddresses),
        signal,
      );
      currentUrl = destination.url;
      const response = await waitWithinSignal(
        requestPinnedImpl(currentUrl, {
          address: destination.address,
          family: destination.family,
          headers: {
            accept: "*/*",
            "user-agent": "umesh-gangadharaiah-external-audit/1.0",
          },
          signal,
        }),
        signal,
      );

      if (redirectStatuses.has(response.status)) {
        const location = response.location;
        if (!location) throw new Error("redirect is missing a location");
        if (redirectCount >= maximumRedirects) throw new RedirectLimitError();
        redirectCount += 1;
        currentUrl = new URL(location, currentUrl);
        continue;
      }

      const finalLocation =
        currentUrl.href === initialUrl.href ? "" : ` -> ${currentUrl.href}`;
      writeLine(`${target.label}: HTTP ${response.status}${finalLocation}`);
      return;
    }
  } catch (error) {
    const reason =
      error instanceof UnsafeDestinationError
        ? "unsafe destination"
        : error instanceof RedirectLimitError
          ? "redirect limit exceeded"
          : signal.aborted
            ? `timeout after ${timeoutMs}ms`
            : "request failed";
    writeLine(`${target.label}: unavailable (${reason})`);
  }
}

export async function auditExternalTargets(options) {
  for (const target of options.targets) {
    await auditTarget(
      target,
      options.timeoutMs,
      options.requestPinnedImpl,
      options.resolveAddresses,
      options.writeLine,
    );
  }
}

async function main() {
  let timeoutMs;
  try {
    timeoutMs = auditTimeoutMs();
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid audit timeout";
    console.log(`External audit configuration: unavailable (${message})`);
    return;
  }

  await auditExternalTargets({
    targets,
    timeoutMs,
    requestPinnedImpl: requestPinned,
    resolveAddresses: async (hostname) =>
      (await lookup(hostname, { all: true, verbatim: true })).map(
        ({ address }) => address,
      ),
    writeLine: console.log,
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
