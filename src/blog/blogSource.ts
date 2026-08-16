export type BlogFormat = "markdown" | "html";

export const blogCategories = [
  { id: "ongoing-projects", label: "Ongoing Projects" },
  { id: "technical-reports", label: "Technical Reports" },
  { id: "notes-and-experiments", label: "Notes & Experiments" },
] as const;

export type BlogCategory = (typeof blogCategories)[number]["id"];

export type BlogPostSummary = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly category: BlogCategory;
  readonly publishedOn: string;
  readonly updatedOn?: string;
  readonly tags: readonly string[];
  readonly format: BlogFormat;
  readonly file: string;
  readonly readingMinutes: number;
};

export type BlogManifest = {
  readonly schemaVersion: 2;
  readonly updatedAt: string;
  readonly posts: readonly BlogPostSummary[];
};

export type BlogSource = {
  readonly owner: string;
  readonly gistId: string;
};

export type BlogRoute =
  | { readonly kind: "none" | "section" | "index" | "invalid" }
  | { readonly kind: "category"; readonly category: BlogCategory }
  | {
      readonly kind: "post";
      readonly slug: string;
      readonly category?: BlogCategory;
    };

type FetchBlogOptions = {
  readonly fetchImpl?: typeof fetch;
  readonly signal?: AbortSignal;
};

const rawGistOrigin = "https://gist.githubusercontent.com";
const manifestFile = "blog-index.json";
const manifestLimitBytes = 128 * 1024;
const postLimitBytes = 256 * 1024;
const requestTimeoutMs = 8_000;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const ownerPattern = /^(?=.{1,39}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/iu;
const gistIdPattern = /^[a-f0-9]{5,64}$/iu;
const filePattern = /^[a-z0-9][a-z0-9._-]{0,119}$/u;
const blogCategoryIds = new Set<BlogCategory>(
  blogCategories.map(({ id }) => id),
);

export class BlogContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogContentError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): void {
  const keys = Object.keys(value).sort();
  const allowed = new Set([...required, ...optional]);
  const missing = required.filter((key) => !(key in value));
  const unexpected = keys.filter((key) => !allowed.has(key));

  if (missing.length > 0 || unexpected.length > 0) {
    throw new BlogContentError(`${label} has unexpected or missing fields.`);
  }
}

function requiredTrimmedString(
  value: unknown,
  label: string,
  maximumLength: number,
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximumLength ||
    value !== value.trim() ||
    [...value].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 31 || codePoint === 127;
    })
  ) {
    throw new BlogContentError(`${label} must be clean text.`);
  }

  return value;
}

function validCalendarDate(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new BlogContentError(`${label} must be an ISO date.`);
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) throw new BlogContentError(`${label} must be an ISO date.`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new BlogContentError(`${label} must be a real calendar date.`);
  }

  return value;
}

function validUpdatedAt(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new BlogContentError("Blog manifest updatedAt must be a UTC timestamp.");
  }

  return value;
}

function validTags(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
    throw new BlogContentError(`${label} must contain one to four tags.`);
  }

  const tags = value.map((tag, index) =>
    requiredTrimmedString(tag, `${label}[${index}]`, 24),
  );
  const normalized = tags.map((tag) => tag.toLocaleLowerCase("en-US"));
  if (new Set(normalized).size !== normalized.length) {
    throw new BlogContentError(`${label} must not contain duplicate tags.`);
  }

  return tags;
}

function validCategory(value: unknown, label: string): BlogCategory {
  if (typeof value !== "string" || !blogCategoryIds.has(value as BlogCategory)) {
    throw new BlogContentError(`${label} must use an approved Blog category.`);
  }
  return value as BlogCategory;
}

function validatePost(value: unknown, index: number): BlogPostSummary {
  const label = `Blog post ${index + 1}`;
  if (!isRecord(value)) throw new BlogContentError(`${label} must be an object.`);

  assertExactKeys(
    value,
    [
      "slug",
      "title",
      "summary",
      "category",
      "publishedOn",
      "tags",
      "format",
      "file",
      "readingMinutes",
    ],
    ["updatedOn"],
    label,
  );

  const slug = requiredTrimmedString(value.slug, `${label} slug`, 80);
  if (!slugPattern.test(slug)) {
    throw new BlogContentError(`${label} slug must use lowercase words and hyphens.`);
  }

  const publishedOn = validCalendarDate(value.publishedOn, `${label} publishedOn`);
  const updatedOn =
    value.updatedOn === undefined
      ? undefined
      : validCalendarDate(value.updatedOn, `${label} updatedOn`);
  if (updatedOn !== undefined && updatedOn < publishedOn) {
    throw new BlogContentError(`${label} updatedOn cannot precede publishedOn.`);
  }

  if (value.format !== "markdown" && value.format !== "html") {
    throw new BlogContentError(`${label} format must be markdown or html.`);
  }

  const file = requiredTrimmedString(value.file, `${label} file`, 120);
  if (!filePattern.test(file)) {
    throw new BlogContentError(`${label} file must be a safe basename.`);
  }
  const expectedExtension = value.format === "markdown" ? ".md" : ".html";
  if (!file.endsWith(expectedExtension)) {
    throw new BlogContentError(`${label} file extension must match its format.`);
  }

  if (
    typeof value.readingMinutes !== "number" ||
    !Number.isInteger(value.readingMinutes) ||
    value.readingMinutes < 1 ||
    value.readingMinutes > 60
  ) {
    throw new BlogContentError(`${label} readingMinutes must be from 1 to 60.`);
  }

  return {
    slug,
    title: requiredTrimmedString(value.title, `${label} title`, 120),
    summary: requiredTrimmedString(value.summary, `${label} summary`, 240),
    category: validCategory(value.category, `${label} category`),
    publishedOn,
    ...(updatedOn === undefined ? {} : { updatedOn }),
    tags: validTags(value.tags, `${label} tags`),
    format: value.format,
    file,
    readingMinutes: value.readingMinutes,
  };
}

export function validateBlogManifest(value: unknown): BlogManifest {
  if (!isRecord(value)) {
    throw new BlogContentError("Blog manifest must be an object.");
  }
  assertExactKeys(value, ["schemaVersion", "updatedAt", "posts"], [], "Blog manifest");
  if (value.schemaVersion !== 2) {
    throw new BlogContentError("Blog manifest schemaVersion must be 2.");
  }
  if (!Array.isArray(value.posts) || value.posts.length > 200) {
    throw new BlogContentError("Blog manifest posts must contain at most 200 entries.");
  }

  const posts = value.posts.map(validatePost);
  const slugs = posts.map(({ slug }) => slug);
  const files = posts.map(({ file }) => file);
  if (new Set(slugs).size !== slugs.length) {
    throw new BlogContentError("Blog manifest slugs must be unique.");
  }
  if (new Set(files).size !== files.length) {
    throw new BlogContentError("Blog manifest files must be unique.");
  }

  return {
    schemaVersion: 2,
    updatedAt: validUpdatedAt(value.updatedAt),
    posts: posts
      .map((post, sourceIndex) => ({ post, sourceIndex }))
      .sort(
        (left, right) =>
          right.post.publishedOn.localeCompare(left.post.publishedOn) ||
          left.sourceIndex - right.sourceIndex,
      )
      .map(({ post }) => post),
  };
}

function validateSource(source: BlogSource): void {
  if (!ownerPattern.test(source.owner) || !gistIdPattern.test(source.gistId)) {
    throw new BlogContentError("Blog source configuration is invalid.");
  }
}

export function buildRawGistFileUrl(
  source: BlogSource,
  file: string,
  version?: string,
): string {
  validateSource(source);
  if (!filePattern.test(file)) {
    throw new BlogContentError("Blog source filename is invalid.");
  }

  const url = new URL(
    `/${source.owner}/${source.gistId}/raw/${encodeURIComponent(file)}`,
    rawGistOrigin,
  );
  if (version !== undefined) url.searchParams.set("v", version);
  return url.href;
}

export function parseBlogRoute(hash: string): BlogRoute {
  if (hash === "#blog") return { kind: "section" };
  if (hash === "#/blog") return { kind: "index" };
  const categoryPostMatch =
    /^#\/blog\/category\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/u.exec(
      hash,
    );
  if (categoryPostMatch) {
    const category = categoryPostMatch[1] as BlogCategory;
    return blogCategoryIds.has(category)
      ? { category, kind: "post", slug: categoryPostMatch[2] }
      : { kind: "invalid" };
  }
  const categoryMatch = /^#\/blog\/category\/([a-z0-9]+(?:-[a-z0-9]+)*)$/u.exec(
    hash,
  );
  if (categoryMatch) {
    const category = categoryMatch[1] as BlogCategory;
    return blogCategoryIds.has(category)
      ? { category, kind: "category" }
      : { kind: "invalid" };
  }
  const postMatch = /^#\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/u.exec(hash);
  if (postMatch) return { kind: "post", slug: postMatch[1] };
  if (hash.startsWith("#/blog")) return { kind: "invalid" };
  return { kind: "none" };
}

function requestSignal(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(requestTimeoutMs);
  return signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
}

function assertResponseLocation(response: Response, source: BlogSource): void {
  let finalUrl: URL;
  try {
    finalUrl = new URL(response.url);
  } catch {
    throw new BlogContentError("Blog source returned an unexpected location.");
  }

  const expectedPathPrefix = `/${source.owner}/${source.gistId}/raw/`;
  if (
    finalUrl.origin !== rawGistOrigin ||
    !finalUrl.pathname.startsWith(expectedPathPrefix)
  ) {
    throw new BlogContentError("Blog source returned an unexpected location.");
  }
}

async function boundedResponseText(
  response: Response,
  maximumBytes: number,
): Promise<string> {
  const advertisedLength = response.headers.get("content-length");
  if (
    advertisedLength !== null &&
    (!/^\d+$/u.test(advertisedLength) || Number(advertisedLength) > maximumBytes)
  ) {
    throw new BlogContentError("Blog content is too large.");
  }

  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maximumBytes) {
      throw new BlogContentError("Blog content is too large.");
    }
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let byteLength = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maximumBytes) {
        await reader.cancel();
        throw new BlogContentError("Blog content is too large.");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } catch (error) {
    if (error instanceof BlogContentError) throw error;
    throw new BlogContentError("Blog content could not be decoded safely.");
  } finally {
    reader.releaseLock();
  }
}

async function fetchText(
  source: BlogSource,
  url: string,
  maximumBytes: number,
  options: FetchBlogOptions,
): Promise<string> {
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      cache: "default",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: requestSignal(options.signal),
    });
  } catch {
    throw new BlogContentError("Notes are temporarily unavailable.");
  }

  if (!response.ok) {
    throw new BlogContentError("Notes are temporarily unavailable.");
  }
  assertResponseLocation(response, source);
  return boundedResponseText(response, maximumBytes);
}

export async function fetchBlogManifest(
  source: BlogSource,
  options: FetchBlogOptions = {},
): Promise<BlogManifest> {
  const url = buildRawGistFileUrl(source, manifestFile);
  const text = await fetchText(source, url, manifestLimitBytes, options);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BlogContentError("Blog manifest is not valid JSON.");
  }
  return validateBlogManifest(parsed);
}

export async function fetchBlogPost(
  source: BlogSource,
  manifest: BlogManifest,
  post: BlogPostSummary,
  options: FetchBlogOptions = {},
): Promise<string> {
  if (!manifest.posts.some(({ slug, file }) => slug === post.slug && file === post.file)) {
    throw new BlogContentError("Requested note is not present in the validated manifest.");
  }
  const url = buildRawGistFileUrl(source, post.file, manifest.updatedAt);
  const sourceText = await fetchText(source, url, postLimitBytes, options);
  const { renderBlogMarkup } = await import("./blogMarkup");
  return renderBlogMarkup(sourceText, post.format);
}
