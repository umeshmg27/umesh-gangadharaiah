/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOG_GIST_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
