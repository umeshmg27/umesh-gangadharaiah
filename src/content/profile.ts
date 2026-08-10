import portrait320Src from "../assets/portfolio/portrait/umesh-gangadharaiah-320.webp";
import portrait640Src from "../assets/portfolio/portrait/umesh-gangadharaiah-640.webp";
import portraitFallbackSrc from "../assets/portfolio/portrait/umesh-gangadharaiah.jpg";

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
    sources: [
      { src: portrait320Src, width: 320, type: "image/webp" },
      { src: portrait640Src, width: 640, type: "image/webp" },
    ],
    width: 800,
    height: 800,
  },
  heroActions: [
    { label: "View Work", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],
} as const satisfies Profile;
