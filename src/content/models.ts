export type RecognitionCategory = "Innovation" | "Mentorship" | "Leadership";

export type LocalImageAsset = {
  readonly kind: "local";
  readonly alt: string;
  readonly fallbackSrc: string;
  readonly sources: readonly {
    readonly src: string;
    readonly width: number;
    readonly type: "image/webp";
  }[];
  readonly width: number;
  readonly height: number;
};

export type RemoteImageAsset = {
  readonly kind: "remote";
  readonly alt: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
};

export type ImageAsset = LocalImageAsset | RemoteImageAsset;

export type Project = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly image: ImageAsset;
  readonly publicUrl?: string;
  readonly featuredOrder?: 1 | 2 | 3 | 4;
};

export type Recognition = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly category: RecognitionCategory;
  readonly image: LocalImageAsset;
  readonly highlightOrder?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type CareerEntry = {
  readonly id: string;
  readonly role: string;
  readonly organization: string;
  readonly location: string;
  readonly period: string;
  readonly summary?: string;
  readonly technologies: readonly string[];
  readonly highlights: readonly string[];
};

export type Profile = {
  readonly name: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly role: string;
  readonly specialization: string;
  readonly githubUrl: string;
  readonly linkedinUrl: string;
  readonly canonicalUrl: string;
  readonly portrait: LocalImageAsset;
  readonly heroActions: readonly {
    readonly label: string;
    readonly href: "#projects" | "#contact";
  }[];
};

export type ImpactMetric = {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly sourceRecordId: string;
};

export type ExpertiseItem = {
  readonly label: string;
  readonly url?: string;
};

export type ExpertiseArea = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly itemsLabel: string;
  readonly items: readonly ExpertiseItem[];
};
