export type RecognitionCategory = "Innovation" | "Mentorship" | "Leadership";

export type LocalImageAsset = {
  kind: "local";
  alt: string;
  fallbackSrc: string;
  sources: readonly {
    src: string;
    width: number;
    type: "image/webp";
  }[];
  width: number;
  height: number;
};

export type RemoteImageAsset = {
  kind: "remote";
  alt: string;
  src: string;
  width: number;
  height: number;
};

export type ImageAsset = LocalImageAsset | RemoteImageAsset;

export type Project = {
  id: string;
  title: string;
  description: string;
  image: ImageAsset;
  publicUrl?: string;
  featuredOrder?: 1 | 2 | 3 | 4;
};

export type Recognition = {
  id: string;
  title: string;
  description: string;
  tags: readonly string[];
  category: RecognitionCategory;
  image: LocalImageAsset;
  highlightOrder?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type CareerEntry = {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  summary?: string;
  technologies: readonly string[];
  highlights: readonly string[];
};

export type Profile = {
  name: string;
  givenName: string;
  familyName: string;
  role: string;
  specialization: string;
  githubUrl: string;
  linkedinUrl: string;
  canonicalUrl: string;
  portrait: LocalImageAsset;
  heroActions: readonly {
    label: string;
    href: "#projects" | "#contact";
  }[];
};

export type ImpactMetric = {
  id: string;
  value: string;
  label: string;
  sourceRecordId: string;
};

export type ExpertiseItem = {
  label: string;
  url?: string;
};

export type ExpertiseArea = {
  id: string;
  title: string;
  description: string;
  itemsLabel: string;
  items: readonly ExpertiseItem[];
};
