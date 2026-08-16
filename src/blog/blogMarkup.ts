import DOMPurify from "dompurify";
import { marked } from "marked";

import { BlogContentError, type BlogFormat } from "./blogSource";

const allowedTags = [
  "p",
  "body",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "strong",
  "em",
  "del",
  "a",
  "hr",
  "br",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

const blockedHosts = new Set([
  "gist.github.com",
  "gist.githubusercontent.com",
  "wwwin-github.cisco.com",
  "cto-github.cisco.com",
  "internal.cisco.com",
]);

function isBlockedHost(hostname: string): boolean {
  return [...blockedHosts].some(
    (blockedHost) =>
      hostname === blockedHost || hostname.endsWith(`.${blockedHost}`),
  );
}

function safeExternalUrl(href: string): URL | null {
  if (href.startsWith("//") || href.includes("\\")) return null;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/\.+$/u, "");
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    isBlockedHost(hostname) ||
    (hostname === "api.github.com" && /^\/gists(?:\/|$)/iu.test(decodedPathname)) ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname) ||
    hostname.includes(":")
  ) {
    return null;
  }

  return url;
}

function hardenLinksAndTables(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;

  for (const heading of template.content.querySelectorAll("h2, h3, h4")) {
    const sourceLevel = Number(heading.tagName.slice(1));
    const normalizedHeading = document.createElement(`h${sourceLevel + 2}`);
    normalizedHeading.replaceChildren(...heading.childNodes);
    heading.replaceWith(normalizedHeading);
  }

  for (const link of template.content.querySelectorAll<HTMLAnchorElement>("a")) {
    const href = link.getAttribute("href");
    if (href?.startsWith("#") && /^#[a-z0-9][a-z0-9-]*$/u.test(href)) {
      link.removeAttribute("target");
      link.removeAttribute("rel");
      continue;
    }

    const safeUrl = href === null ? null : safeExternalUrl(href);
    if (!safeUrl) {
      throw new BlogContentError("Blog note contains a link that is not public and safe.");
    }
    link.href = safeUrl.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  for (const table of template.content.querySelectorAll("table")) {
    table.setAttribute("data-contained-horizontal-scroll", "true");
  }

  return template.innerHTML;
}

export function renderBlogMarkup(source: string, format: BlogFormat): string {
  if (
    format === "html" &&
    /<(?:!doctype|html|head|body)\b/iu.test(source)
  ) {
    throw new BlogContentError("HTML notes must be document fragments.");
  }

  const rendered =
    format === "markdown"
      ? marked.parse(source, { async: false, breaks: false, gfm: true })
      : source;
  if (typeof rendered !== "string") {
    throw new BlogContentError("Blog note could not be rendered.");
  }

  const sanitized = DOMPurify.sanitize(rendered, {
    ALLOWED_ATTR: ["href", "title", "scope", "colspan", "rowspan"],
    ALLOWED_TAGS: [...allowedTags],
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ["style", "srcdoc"],
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "meta",
      "base",
      "link",
      "img",
      "svg",
      "math",
      "template",
      "audio",
      "video",
    ],
  });

  if (format === "html" && DOMPurify.removed.length > 0) {
    throw new BlogContentError("HTML note contains markup that is not allowed.");
  }

  return hardenLinksAndTables(sanitized);
}
