/// <reference types="node" />

import { createHash } from "node:crypto";

import expectedKollectCuriFallbackSrc from "../assets/images/mock04.png";
import expectedResourceAllocationManagerFallbackSrc from "../assets/images/mock05.png";
import expectedPortraitFallbackSrc from "../assets/images/umesh-ug.jpg";

import { careerEntries } from "./career";
import { expertiseAreas } from "./expertise";
import { impactMetrics } from "./impact";
import type { LocalImageAsset } from "./models";
import { profile } from "./profile";
import { projects } from "./projects";
import { recognitions } from "./recognitions";

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function portableLocalPath(image: LocalImageAsset): string {
  if (image.fallbackSrc === expectedPortraitFallbackSrc) return "import:umesh-ug.jpg";
  if (image.fallbackSrc === expectedResourceAllocationManagerFallbackSrc) {
    return "import:mock05.png";
  }
  if (image.fallbackSrc === expectedKollectCuriFallbackSrc) return "import:mock04.png";
  expect(image.fallbackSrc.startsWith(import.meta.env.BASE_URL)).toBe(true);
  return image.fallbackSrc.slice(import.meta.env.BASE_URL.length);
}

describe("approved editorial corrections", () => {
  it("keeps the complete public profile outside the editorial allowlist", () => {
    expect(profile).toEqual({
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
        fallbackSrc: expectedPortraitFallbackSrc,
        sources: [],
        width: 800,
        height: 800,
      },
      heroActions: [
        { label: "View Work", href: "#projects" },
        { label: "Contact", href: "#contact" },
      ],
    });
  });

  it("uses only the approved tool-label capitalization", () => {
    expect(expertiseAreas.map(({ items }) => items.map(({ label }) => label))).toEqual([
      ["Golang", "Python", "C++", "MongoDB", "Redis"],
      [
        "SMALL LLMS FOR EDGE COMPUTING",
        "MULTI-STAGE FINE-TUNING PROCESS",
        "LangChain",
        "RAG",
        "Hugging Face",
        "LlamaIndex",
        "Streamlit",
      ],
      ["SonarQube", "Docker", "Kubernetes", "Linux"],
      ["VS Code", "Postman", "pprof", "Hugging Face", "LlamaIndex", "Streamlit"],
    ]);
  });

  it("locks the approved expertise and ND-AlphaX copy edits exactly", () => {
    expect(expertiseAreas.map(({ description }) => description)).toEqual([
      " Experienced backend engineer with hands-on expertise in designing and managing microservices within large-scale distributed systems. I’ve built reliable workflows, implemented robust configuration validation logic, and optimized deployment dependency resolution using graph algorithms. My work emphasizes maintaining consistency and correctness across services, handling complex interactions in distributed environments to ensure stability and reliability. With a keen eye for identifying critical flaws in architecture, I deliver scalable, low-impact solutions that support high-availability systems.",
      "I'm a big fan of Generative AI and Large Language Models (LLMs), and I've had the chance to dive deep into these technologies through research and experimentation. My work focuses on improving LLMs' language understanding and responsiveness, while also deploying smaller models for internal tools to test new possibilities. Right now, I'm working on a proof of concept (PoC) to bring these AI solutions to life in exciting, real-world applications!",
      "Beyond backend development, I bring a strong skill set in DevOps and internal automation. I’m skilled at building tools that boost team efficiency, like automating a custom Go-based code coverage framework to improve test visibility and streamline development workflows. I also write smart in-house scripts that bridge the gap between development and QA, handling tasks like upgrade, backup, and restore with zero manual hassle. My ability to think beyond just code—optimizing processes, reducing errors, and tightening release cycles—is a big part of how I help teams move faster and ship more reliably.",
      "My approach with tools, services and platforms is hands-on, curiosity-driven, allowing me to be agile and adapt to the latest technology across development, automation and debugging workflows. I’ve used Docker and Kubernetes extensively for containerization and deployment, along with FastAPI, ReactJS, and HAProxy for building and managing robust microservices. For performance optimization, I’ve recently been leveraging Go’s pprof to profile and fine-tune services, leading to significant improvements in scale metrics. I’m also comfortable with databases like MongoDB, Redis, and ArangoDB, and often write internal scripts to improve developer productivity and system observability.",
    ]);
    expect(projects.find(({ id }) => id === "nd-alphax")?.description).toBe(
      "Part of the design team, developing a key product feature that would shape the future of data center networking.",
    );
  });

  it("normalizes only the presentation of the four existing career periods", () => {
    expect(careerEntries.map(({ period }) => period)).toEqual([
      "Aug 2024 – Present",
      "Aug 2022 – Jul 2024",
      "Aug 2021 – Jul 2022",
      "Jan 2021 – Jul 2021",
    ]);
    const entriesWithoutPeriods = careerEntries.map(({ period, ...unchangedEntry }) => {
      expect(period).not.toBe("");
      return unchangedEntry;
    });
    expect(entriesWithoutPeriods).toEqual([
      {
        id: "cisco-software-engineer-iii",
        role: "Software Engineer III",
        organization: "Cisco Systems",
        location: "IN",
        summary: "Network Backend development, GenAI/LLM, Mentorship and Feature owner",
        technologies: [],
        highlights: [],
      },
      {
        id: "cisco-software-engineer-ii",
        role: "Software Engineer II",
        organization: "Cisco Systems",
        location: "IN",
        technologies: ["Golang", "Docker", "Microservices", "APIC", "Graph Algorithms"],
        highlights: [
          "Integrated L4-L7 service graphs into NDO for simplified workflows",
          "Owned two microservices validating and converting configs into APIC MO format",
          "Enhanced deployment cycle detection using graph algorithms",
          "Fixed critical multisite design flaw affecting data center sync",
          "Reduced release-phase bugs to near-zero through extensive QA & dev work",
        ],
      },
      {
        id: "cisco-staff-engineer-intern",
        role: "Staff Engineer Intern",
        organization: "Cisco Systems",
        location: "IN",
        technologies: ["React", "Python", "FastAPI", "Docker"],
        highlights: [
          "Built Resource Allocation Manager (RAM) for staffing automation",
          "Created chatbot (CURI) for internal queries using Webex APIs",
          "Automated multiserver configurations saving 300+ hours",
        ],
      },
      {
        id: "cisco-intern",
        role: "Intern",
        organization: "Cisco Systems",
        location: "IN",
        technologies: [
          "Infrastructure Automation",
          "Internal Tooling",
          "Web UI Development",
        ],
        highlights: [
          "Designed and developed a UCS configuration automation tool, reducing manual effort and increasing efficiency",
          "Built an internal React-based web UI with form validation and API integration to standardize data input",
        ],
      },
    ]);
  });

  it("corrects only the approved recognition title phrases", () => {
    expect(recognitions.map(({ title }) => title)).toEqual([
      "Cisco KT Sessions",
      "Ownership towards NDO ESG triages",
      "Release ownership and triages",
      "The right help at the right time",
      "Feature Ownership",
      "Driving ESG IT",
      "Contribution to ESG feature IT",
      "Thank you for excellent work on Restore feature",
      "Thank you for excellent work on Backup & Restore feature",
      "Team Player",
      "Internal Tools Development",
      "Root Cause Analysis and Release",
      "Development test and RCA",
      "Driving ESG IT",
      "Congratulations on winning 2023 Asia-Pacific Stevie Bronze award",
      "Onboarding and ramping up with different codebases",
      "Onboarding and ramping up with different codebases",
      "Training interns",
      "Onboarding and ramping up",
      "Innovation: Internal Tool",
      "Innovation: Internal Tool",
      "Innovation: Internal Tool",
      "Innovation: Internal Tool",
      "Innovation: Internal Tool",
      "Innovation: Internal Tool",
    ]);
    expect(recognitions.every(({ image, title }) => image.alt === `Recognition: ${title}`)).toBe(
      true,
    );
  });

  it("preserves every non-allowlisted fact and quoted recognition body", () => {
    expect(sha256(recognitions.map(({ description }) => description))).toBe(
      "9cc28e43b9d0cca80e30827b930df8a15b1cd0d3ecdff8fa1781680b2efb2b7b",
    );
    expect(
      sha256(
        recognitions.map((recognition) => ({
          id: recognition.id,
          description: recognition.description,
          tags: recognition.tags,
          category: recognition.category,
          imagePath: portableLocalPath(recognition.image),
          imageSources: recognition.image.sources,
          imageWidth: recognition.image.width,
          imageHeight: recognition.image.height,
          highlightOrder:
            "highlightOrder" in recognition ? recognition.highlightOrder : null,
        })),
      ),
    ).toBe("5c01b08d4d09d1c11f391d970291e23a258442ef27f0c0c09ebd1bb08e1621d5");
    expect(
      sha256(
        projects.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.id === "nd-alphax" ? null : project.description,
          image:
            project.image.kind === "local"
              ? {
                  kind: project.image.kind,
                  alt: project.image.alt,
                  path: portableLocalPath(project.image),
                  sources: project.image.sources,
                  width: project.image.width,
                  height: project.image.height,
                }
              : project.image,
          featuredOrder:
            "featuredOrder" in project ? project.featuredOrder : null,
          publicUrl: "publicUrl" in project ? project.publicUrl : null,
        })),
      ),
    ).toBe("82dd01b27e6d5e87de7d2a4c0d80d5f1dbc9dde68baca0770f4354293500c0f1");
    expect(
      sha256(projects.slice(1).map(({ title, description }) => ({ title, description }))),
    ).toBe("f7491975cac441bfa13d5900ca9c6ba02b494f91f6254166fdfa25c2d26be8f5");
    expect(impactMetrics).toEqual([
      {
        id: "policy-objects-indexed",
        value: "50,000+",
        label: "policy objects indexed",
        sourceRecordId: "ndo-search-explore",
      },
      {
        id: "policy-retrieval-speed",
        value: "Sub-second",
        label: "policy retrieval",
        sourceRecordId: "ndo-search-explore",
      },
      {
        id: "manual-hours-saved",
        value: "300+ hours",
        label: "manual effort saved",
        sourceRecordId: "cisco-staff-engineer-intern",
      },
      {
        id: "manual-effort-reduced",
        value: "70%",
        label: "manual effort reduced",
        sourceRecordId: "codeshift-cicd-platform",
      },
    ]);
    expect(
      expertiseAreas.map(({ id, title, itemsLabel, items }) => ({
        id,
        title,
        itemsLabel,
        publicationUrls: items.flatMap((item) => ("url" in item ? [item.url] : [])),
      })),
    ).toEqual([
      {
        id: "backend-systems",
        title: "Backend Engineer - Distributed Systems & Infrastructure",
        itemsLabel: "Tech stack:",
        publicationUrls: [],
      },
      {
        id: "generative-ai",
        title: "Exploring Generative AI & LLMs",
        itemsLabel: "Tech stack & Papers:",
        publicationUrls: [
          "https://www.tdcommons.org/dpubs_series/7086/",
          "https://www.tdcommons.org/dpubs_series/7085/",
        ],
      },
      {
        id: "devops-automation",
        title: "DevOps & Automation",
        itemsLabel: "Tech stack:",
        publicationUrls: [],
      },
      {
        id: "engineering-tools",
        title: "Tools",
        itemsLabel: "Tech stack:",
        publicationUrls: [],
      },
    ]);
  });
});
