/// <reference types="node" />

import { createHash } from "node:crypto";

import expectedPortrait320Src from "../assets/portfolio/portrait/umesh-gangadharaiah-320.webp";
import expectedPortrait640Src from "../assets/portfolio/portrait/umesh-gangadharaiah-640.webp";
import expectedPortraitFallbackSrc from "../assets/portfolio/portrait/umesh-gangadharaiah.jpg";

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
        sources: [
          { src: expectedPortrait320Src, width: 320, type: "image/webp" },
          { src: expectedPortrait640Src, width: 640, type: "image/webp" },
        ],
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
      [
        "AI Agents",
        "Reusable Skills",
        "Model Context Protocol",
        "LLMs",
        "Multi-Agent Orchestration",
        "Small LLMs for Edge Computing",
        "Multi-Stage Fine-Tuning Process",
      ],
      ["Golang", "Python", "C++", "MongoDB", "Redis"],
      ["Docker", "Kubernetes", "Linux", "CI/CD", "SonarQube"],
      ["Automated Testing", "Simulation", "pprof", "Observability", "Postman"],
    ]);
  });

  it("locks the approved expertise and public-safe NexusOne copy exactly", () => {
    expect(expertiseAreas.map(({ description }) => description)).toEqual([
      "I design AI-assisted engineering workflows with agents, reusable Skills, and Model Context Protocol (MCP) integrations. My focus is dependable orchestration: grounding work in traceable evidence, keeping people responsible for decisions, and turning complex engineering tasks into repeatable paths from investigation and planning through implementation and validation.",
      "I build backend services for distributed systems where consistency, recovery, and clear service boundaries matter. On NexusOne, I applied that approach to service integration, lifecycle reliability, automated validation, and release hardening as part of a broader engineering team.",
      "I automate the work around software delivery—from repeatable environments and test pipelines to release checks and recovery workflows. I use containers, Kubernetes, Linux, and CI/CD tooling to reduce manual steps, make failures easier to reproduce, and help teams ship changes with greater confidence.",
      "I treat validation as part of feature design. I build automated tests, deterministic simulations, profiling, and debugging workflows that expose edge cases early and make complex behavior easier to understand. This approach helps me investigate defects, harden distributed features, and support reliable releases.",
    ]);
    expect(projects.find(({ id }) => id === "nd-nexusone")).toMatchObject({
      title: "ND — NexusOne",
      description:
        "I helped design and deliver a key data-center networking capability for NexusOne, serving as a backend code owner. I used agent-assisted planning, documentation, and validation to help move the work from early design through release, alongside core backend implementation, automated testing, and reliability hardening. I’ve generalized the details here and left out internal architecture, interfaces, repositories, release information, and operational data.",
      capabilities: [
        "Backend code ownership",
        "Agent-assisted planning",
        "Living documentation",
        "Release validation",
      ],
      abstracted: true,
      featuredOrder: 1,
    });
  });

  it("locks the approved current role and preserves the prior career history", () => {
    expect(careerEntries.map(({ period }) => period)).toEqual([
      "Oct 2025 – Present",
      "Aug 2024 – Sep 2025",
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
        id: "cisco-senior-software-engineer",
        role: "Senior Software Engineer",
        organization: "Cisco Systems",
        location: "IN",
        summary:
          "Agentic engineering, developer automation, feature development, and bug resolution",
        technologies: [
          "AI Agents",
          "Reusable Skills",
          "Model Context Protocol (MCP)",
          "LLMs",
        ],
        highlights: [
          "Build multiple AI agents, reusable Skills, and Model Context Protocol (MCP) integrations to automate day-to-day engineering tasks",
          "Drive feature development through agent-assisted workflows spanning implementation, validation, and delivery",
          "Use AI agents to investigate and resolve software defects, increasing bug-resolution throughput by up to 5–6× per engineer and across the wider team",
        ],
      },
      {
        id: "cisco-software-engineer-iii",
        role: "Software Engineer III",
        organization: "Cisco Systems",
        location: "IN",
        summary:
          "Backend feature ownership for NexusOne across distributed systems integration, automated validation, and release readiness",
        technologies: [
          "Golang",
          "Microservices",
          "Distributed Systems",
          "Network Automation",
          "Automated Testing",
        ],
        highlights: [
          "I helped deliver a major NexusOne networking capability with a broader engineering team and owned substantial backend work through implementation and release integration",
          "I contributed to distributed workflows and service integration across the capability’s lifecycle, with an emphasis on consistent state and reliable behavior",
          "I strengthened reliability across lifecycle and topology scenarios through recovery-focused engineering, integration fixes, and hands-on validation",
          "I built broad automated test coverage and engineering documentation to support release readiness and continued hardening",
        ],
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
    ).toBe("00201627a559b481d3419b413dd84522ac8403af0edc073e3ebe9f054ed9976e");
    expect(
      sha256(
        projects
          .slice(1, 12)
          .map(({ title, description }) => ({ title, description })),
      ),
    ).toBe("f7491975cac441bfa13d5900ca9c6ba02b494f91f6254166fdfa25c2d26be8f5");
    expect(projects.at(-1)).toMatchObject({
      id: "agentic-engineering-automation",
      image: { kind: "abstract" },
      abstracted: true,
    });
    expect(projects.at(-1)).toMatchObject({
      flows: [
        {
          id: "defect-resolution",
          title: "Finding and fixing bugs",
          path: "Issue context → Evidence → Root cause → Validation",
        },
        {
          id: "feature-planning",
          title: "Planning features before coding",
          path: "Feature request → Existing behavior → Delivery plan → Tests",
        },
        {
          id: "living-documentation",
          title: "Documenting complex systems",
          path: "Verified behavior → System map → Practical guide",
        },
        {
          id: "simulation-validation",
          title: "Simulating and validating behavior",
          path: "Synthetic scenario → Simulation → Validation evidence",
        },
      ],
    });
    expect(impactMetrics).toEqual([
      {
        id: "agentic-resolution-throughput",
        value: "Up to 5–6×",
        label: "reported defect-resolution throughput",
        sourceRecordId: "agentic-engineering-automation",
      },
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
        id: "generative-ai",
        title: "Agentic Engineering & Applied AI",
        itemsLabel: "Focus areas & publications:",
        publicationUrls: [
          "https://www.tdcommons.org/dpubs_series/7086/",
          "https://www.tdcommons.org/dpubs_series/7085/",
        ],
      },
      {
        id: "backend-systems",
        title: "Distributed Backend Systems",
        itemsLabel: "Core stack:",
        publicationUrls: [],
      },
      {
        id: "devops-automation",
        title: "Engineering Automation & Release Reliability",
        itemsLabel: "Core stack:",
        publicationUrls: [],
      },
      {
        id: "engineering-tools",
        title: "Validation, Debugging & Performance",
        itemsLabel: "Methods & tools:",
        publicationUrls: [],
      },
    ]);
  });
});
