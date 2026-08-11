import { request as requestHttp } from "node:http";
import { request as requestHttps } from "node:https";
import { isIP } from "node:net";

function createPinnedLookup(expectedHostname, address, family) {
  return (hostname, lookupOptions, callback) => {
    queueMicrotask(() => {
      if (hostname !== expectedHostname) {
        callback(new Error("unexpected lookup hostname"), "", family);
        return;
      }

      const result = { address, family };
      if (lookupOptions?.all) {
        callback(null, [result]);
        return;
      }
      callback(null, address, family);
    });
  };
}

export function requestPinned(url, options) {
  const requestForProtocol =
    url.protocol === "http:"
      ? requestHttp
      : url.protocol === "https:"
        ? requestHttps
        : null;
  if (!requestForProtocol) {
    return Promise.reject(new Error("unsupported request protocol"));
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const tlsOptions =
    url.protocol === "https:"
      ? {
          rejectUnauthorized: true,
          servername: isIP(hostname) === 0 ? hostname : undefined,
        }
      : {};

  return new Promise((resolve, reject) => {
    const request = requestForProtocol(
      {
        ...tlsOptions,
        agent: false,
        family: options.family,
        headers: { ...options.headers, host: url.host },
        hostname,
        lookup: createPinnedLookup(
          hostname,
          options.address,
          options.family,
        ),
        method: "GET",
        path: `${url.pathname}${url.search}`,
        port: url.port || undefined,
        protocol: url.protocol,
        signal: options.signal,
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location ?? null;
        response.on("error", () => undefined);
        response.destroy();
        resolve({ location, status });
      },
    );
    request.once("error", reject);
    request.end();
  });
}
