import portraitFallbackSrc from "../assets/images/umesh-ug.jpg";

import type { Profile } from "./models";

export const profile = {
  name: "Umesh Gangadharaiah",
  givenName: "Umesh",
  familyName: "Gangadharaiah",
  role: "Backend Engineer",
  specialization: "Distributed Systems & Infrastructure",
  githubUrl: "https://github.com/umeshmg27",
  linkedinUrl: "https://www.linkedin.com/in/umeshmg/",
  canonicalUrl: "https://umeshmg27.github.io/umesh-gangadharaiah/",
  portrait: {
    kind: "local",
    alt: "Umesh Gangadharaiah",
    fallbackSrc: portraitFallbackSrc,
    sources: [],
    width: 800,
    height: 800,
  },
  heroActions: [
    { label: "View Work", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],
} as const satisfies Profile;
