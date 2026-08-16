import { BookOpenText, Clock3, RotateCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  blogCategories,
  fetchBlogManifest,
  fetchBlogPost,
  parseBlogRoute,
  type BlogCategory,
  type BlogManifest,
  type BlogPostSummary,
  type BlogRoute,
  type BlogSource,
} from "../blog/blogSource";
import styles from "./BlogSection.module.css";

type BlogSectionProps = {
  readonly source?: BlogSource | null;
  readonly fetchImpl?: typeof fetch;
};

type ManifestState =
  | { readonly status: "empty" | "loading" | "error" }
  | { readonly status: "ready"; readonly manifest: BlogManifest };

type PostState =
  | { readonly status: "idle" }
  | { readonly status: "error"; readonly slug: string }
  | { readonly status: "ready"; readonly slug: string; readonly html: string };

const configuredGistId = import.meta.env.VITE_BLOG_GIST_ID?.trim();
const configuredSource: BlogSource | null = configuredGistId
  ? { owner: "umeshmg27", gistId: configuredGistId }
  : null;
const defaultFetch: typeof fetch = (input, init) => fetch(input, init);
const defaultDocumentTitle = "Umesh Gangadharaiah | Backend Engineer";

function currentRoute(): BlogRoute {
  return parseBlogRoute(window.location.hash);
}

function readableDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function categoryLabel(category: BlogCategory): string {
  return blogCategories.find(({ id }) => id === category)?.label ?? category;
}

function categoryRoute(category: BlogCategory): string {
  return `#/blog/category/${category}`;
}

function postRoute(
  post: BlogPostSummary,
  category: BlogCategory | null,
): string {
  return category
    ? `${categoryRoute(category)}/${post.slug}`
    : `#/blog/${post.slug}`;
}

function BlogCard({
  category,
  post,
}: {
  readonly category: BlogCategory | null;
  readonly post: BlogPostSummary;
}) {
  return (
    <article
      aria-labelledby={`blog-${post.slug}-heading`}
      className={styles.card}
      data-blog-category={post.category}
      data-blog-slug={post.slug}
    >
      <p className={styles.categoryBadge}>{categoryLabel(post.category)}</p>
      <div className={styles.cardMeta}>
        <time dateTime={post.publishedOn}>{readableDate(post.publishedOn)}</time>
        <span aria-label={`${post.readingMinutes} minute read`}>
          <Clock3 aria-hidden="true" focusable="false" size={15} />
          {post.readingMinutes} min read
        </span>
      </div>
      <h3 className={styles.cardHeading} id={`blog-${post.slug}-heading`}>
        {post.title}
      </h3>
      <p className={styles.summary}>{post.summary}</p>
      <ul aria-label="Tags" className={styles.tags}>
        {post.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <a className={styles.readLink} href={postRoute(post, category)}>
        Read post <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

export default function BlogSection({
  source = configuredSource,
  fetchImpl = defaultFetch,
}: BlogSectionProps) {
  const [manifestState, setManifestState] = useState<ManifestState>(() =>
    source ? { status: "loading" } : { status: "empty" },
  );
  const [manifestAttempt, setManifestAttempt] = useState(0);
  const [postAttempt, setPostAttempt] = useState(0);
  const [route, setRoute] = useState<BlogRoute>(currentRoute);
  const [postState, setPostState] = useState<PostState>({ status: "idle" });
  const [expandedView, setExpandedView] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const blogHeadingRef = useRef<HTMLHeadingElement>(null);
  const activeIndexLinkRef = useRef<HTMLAnchorElement>(null);
  const postHeadingRef = useRef<HTMLHeadingElement>(null);
  const restoreIndexFocusRef = useRef(false);
  const routeRef = useRef(route);
  const activeCategory = route.kind === "category" ? route.category : null;
  const showIndex =
    route.kind === "none" ||
    route.kind === "section" ||
    route.kind === "index" ||
    route.kind === "category";

  useEffect(() => {
    const updateRoute = () => {
      const nextRoute = currentRoute();
      if (
        routeRef.current.kind === "post" &&
        (nextRoute.kind === "section" ||
          nextRoute.kind === "index" ||
          nextRoute.kind === "category")
      ) {
        restoreIndexFocusRef.current = true;
      }
      routeRef.current = nextRoute;
      setRoute(nextRoute);
    };
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  useEffect(() => {
    if (!source) return undefined;

    const controller = new AbortController();
    void fetchBlogManifest(source, {
      fetchImpl,
      signal: controller.signal,
    }).then(
      (manifest) => {
        if (!controller.signal.aborted) {
          setManifestState({ status: "ready", manifest });
        }
      },
      () => {
        if (!controller.signal.aborted) setManifestState({ status: "error" });
      },
    );

    return () => controller.abort();
  }, [fetchImpl, manifestAttempt, source]);

  const selectedPost = useMemo(() => {
    if (manifestState.status !== "ready" || route.kind !== "post") return null;
    const post =
      manifestState.manifest.posts.find(({ slug }) => slug === route.slug) ?? null;
    if (post && route.category && post.category !== route.category) return null;
    return post;
  }, [manifestState, route]);

  useEffect(() => {
    if (
      !source ||
      manifestState.status !== "ready" ||
      route.kind !== "post" ||
      !selectedPost
    ) return undefined;

    const controller = new AbortController();
    void fetchBlogPost(source, manifestState.manifest, selectedPost, {
      fetchImpl,
      signal: controller.signal,
    }).then(
      (html) => {
        if (!controller.signal.aborted) {
          setPostState({ status: "ready", slug: selectedPost.slug, html });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setPostState({ status: "error", slug: selectedPost.slug });
        }
      },
    );

    return () => controller.abort();
  }, [fetchImpl, manifestState, postAttempt, route, selectedPost, source]);

  useEffect(() => {
    if (route.kind !== "post" || !selectedPost) {
      document.title = defaultDocumentTitle;
      return;
    }

    document.title = `${selectedPost.title} | Umesh Gangadharaiah`;
    sectionRef.current?.scrollIntoView?.({ behavior: "auto", block: "start" });
    postHeadingRef.current?.focus({ preventScroll: true });
  }, [route.kind, selectedPost]);

  useEffect(() => {
    if (!showIndex || !restoreIndexFocusRef.current) return;

    restoreIndexFocusRef.current = false;
    sectionRef.current?.scrollIntoView?.({ behavior: "auto", block: "start" });
    (activeIndexLinkRef.current ?? blogHeadingRef.current)?.focus({
      preventScroll: true,
    });
  }, [showIndex]);

  useEffect(
    () => () => {
      document.title = defaultDocumentTitle;
    },
    [],
  );

  const manifest = manifestState.status === "ready" ? manifestState.manifest : null;
  const filteredPosts = manifest
    ? activeCategory
      ? manifest.posts.filter(({ category }) => category === activeCategory)
      : manifest.posts
    : [];
  const viewKey = activeCategory ?? "all-notes";
  const showAll = expandedView === viewKey;
  const visiblePosts = showAll ? filteredPosts : filteredPosts.slice(0, 3);
  let selectedPostIsLoading = false;
  if (selectedPost) {
    selectedPostIsLoading =
      postState.status === "idle" || postState.slug !== selectedPost.slug;
  }

  const returnToIndex = () => {
    restoreIndexFocusRef.current = true;
  };

  const postCategory =
    route.kind === "post" ? (route.category ?? null) : null;
  const backHref = postCategory ? categoryRoute(postCategory) : "#/blog";
  const backLabel = postCategory
    ? `Back to ${categoryLabel(postCategory)}`
    : "Back to All Notes";

  return (
    <section
      aria-labelledby="blog-heading"
      className={styles.section}
      id="blog"
      ref={sectionRef}
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Technical writing</p>
          <h2
            className={styles.heading}
            id="blog-heading"
            ref={blogHeadingRef}
            tabIndex={-1}
          >
            Blog
          </h2>
        </div>
        <p className={styles.introduction}>
          Project updates, technical investigations, and practical
          experiments—written to share useful ideas without internal details.
        </p>
      </div>

      {manifestState.status === "loading" ? (
        <p aria-live="polite" className={styles.state} role="status">
          Loading notes…
        </p>
      ) : null}

      {manifestState.status === "error" ? (
        <div className={styles.state} role="alert">
          <p>Notes are temporarily unavailable. The rest of the portfolio is unaffected.</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setManifestState({ status: "loading" });
              setManifestAttempt((attempt) => attempt + 1);
            }}
            type="button"
          >
            <RotateCw aria-hidden="true" focusable="false" size={16} />
            Retry loading notes
          </button>
        </div>
      ) : null}

      {manifestState.status === "empty" || (manifest && manifest.posts.length === 0) ? (
        <div className={styles.emptyState}>
          <BookOpenText aria-hidden="true" focusable="false" size={28} />
          <p>
            I’m working on the first note. This is where I’ll share practical
            lessons from building, debugging, and automating software.
          </p>
        </div>
      ) : null}

      {manifest && showIndex && manifest.posts.length > 0 ? (
        <>
          <nav aria-label="Blog categories" className={styles.categoryNavigation}>
            <ul className={styles.categoryList}>
              <li>
                <a
                  aria-controls="blog-post-results"
                  aria-current={activeCategory === null ? "page" : undefined}
                  className={styles.categoryLink}
                  href="#/blog"
                  onClick={() => setExpandedView(null)}
                  ref={activeCategory === null ? activeIndexLinkRef : undefined}
                >
                  All Notes <span>({manifest.posts.length})</span>
                </a>
              </li>
              {blogCategories.map((category) => {
                const count = manifest.posts.filter(
                  (post) => post.category === category.id,
                ).length;
                const active = activeCategory === category.id;

                return (
                  <li key={category.id}>
                    <a
                      aria-controls="blog-post-results"
                      aria-current={active ? "page" : undefined}
                      className={styles.categoryLink}
                      href={categoryRoute(category.id)}
                      onClick={() => setExpandedView(null)}
                      ref={active ? activeIndexLinkRef : undefined}
                    >
                      {category.label} <span>({count})</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div id="blog-post-results">
            <div aria-live="polite" className={styles.indexSummary}>
              {filteredPosts.length > 3 && !showAll
                ? `Showing the latest 3 of ${filteredPosts.length} posts in ${
                    activeCategory ? categoryLabel(activeCategory) : "All Notes"
                  }, newest first.`
                : `${filteredPosts.length} ${
                    filteredPosts.length === 1 ? "post" : "posts"
                  } in ${
                    activeCategory ? categoryLabel(activeCategory) : "All Notes"
                  }, newest first.`}
            </div>

            {filteredPosts.length > 0 ? (
              <div className={styles.grid} id="blog-post-list">
                {visiblePosts.map((post) => (
                  <BlogCard
                    category={activeCategory}
                    key={post.slug}
                    post={post}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <BookOpenText aria-hidden="true" focusable="false" size={28} />
                <p>
                  No {activeCategory ? categoryLabel(activeCategory) : "notes"} yet.
                </p>
              </div>
            )}

            {filteredPosts.length > 3 ? (
              <button
                aria-controls="blog-post-list"
                aria-expanded={showAll}
                className={styles.archiveControl}
                onClick={() =>
                  setExpandedView((current) =>
                    current === viewKey ? null : viewKey,
                  )
                }
                type="button"
              >
                {showAll
                  ? "Show latest posts"
                  : `View all ${filteredPosts.length} posts`}
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {manifest && !showIndex && (route.kind === "invalid" || !selectedPost) ? (
        <div className={styles.state}>
          <h3>Note not found</h3>
          <p>The requested note is not part of the published Blog index.</p>
          <a className={styles.backLink} href={backHref} onClick={returnToIndex}>
            {backLabel}
          </a>
        </div>
      ) : null}

      {manifest && selectedPost && route.kind === "post" ? (
        <article
          aria-labelledby="selected-blog-post-heading"
          className={styles.post}
          data-blog-post={selectedPost.slug}
        >
          <a className={styles.backLink} href={backHref} onClick={returnToIndex}>
            <span aria-hidden="true">←</span> {backLabel}
          </a>
          <div className={styles.postMeta}>
            <span className={styles.postCategory}>
              {categoryLabel(selectedPost.category)}
            </span>
            <time dateTime={selectedPost.publishedOn}>
              {readableDate(selectedPost.publishedOn)}
            </time>
            <span>{selectedPost.readingMinutes} min read</span>
          </div>
          <h3
            className={styles.postHeading}
            id="selected-blog-post-heading"
            ref={postHeadingRef}
            tabIndex={-1}
          >
            {selectedPost.title}
          </h3>
          <p className={styles.postSummary}>{selectedPost.summary}</p>
          <ul aria-label="Tags" className={styles.tags}>
            {selectedPost.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          {selectedPostIsLoading ? (
            <p aria-live="polite" className={styles.state} role="status">
              Loading note…
            </p>
          ) : null}
          {postState.status === "error" && postState.slug === selectedPost.slug ? (
            <div className={styles.state} role="alert">
              <p>This note is temporarily unavailable.</p>
              <button
                className={styles.retryButton}
                onClick={() => {
                  setPostState({ status: "idle" });
                  setPostAttempt((attempt) => attempt + 1);
                }}
                type="button"
              >
                <RotateCw aria-hidden="true" focusable="false" size={16} />
                Retry loading note
              </button>
            </div>
          ) : null}
          {postState.status === "ready" && postState.slug === selectedPost.slug ? (
            <div
              className={styles.postBody}
              dangerouslySetInnerHTML={{ __html: postState.html }}
            />
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
