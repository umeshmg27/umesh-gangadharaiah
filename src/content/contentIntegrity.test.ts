/// <reference types="node" />

import { createHash } from "node:crypto";

import expectedKollectCuriFallbackSrc from "../assets/images/mock04.png";
import expectedResourceAllocationManagerFallbackSrc from "../assets/images/mock05.png";
import expectedPortraitFallbackSrc from "../assets/images/umesh-ug.jpg";

import { careerEntries } from "./career";
import { expertiseAreas } from "./expertise";
import { impactMetrics } from "./impact";
import { profile } from "./profile";
import { projects } from "./projects";
import { recognitions } from "./recognitions";
import type { LocalImageAsset, Profile, Project, Recognition } from "./models";

function assertReadonlyContentContracts(): void {
  const project = {} as Project;
  // @ts-expect-error Content contracts must make project fields readonly.
  project.title = "Changed";

  const recognition = {} as Recognition;
  // @ts-expect-error Content contracts must make recognition fields readonly.
  recognition.title = "Changed";
  // @ts-expect-error Nested recognition image metadata must remain readonly.
  recognition.image.width = 1;
  // @ts-expect-error The recognition image factory must preserve inferred readonly fields.
  recognitions[0].image.width = 1;

  const profileContract = {} as Profile;
  // @ts-expect-error Nested profile action fields must remain readonly.
  profileContract.heroActions[0].label = "Changed";

  const localImage = {} as LocalImageAsset;
  // @ts-expect-error Responsive source entries must remain readonly.
  localImage.sources[0].src = "changed.webp";
}

void assertReadonlyContentContracts;

const projectIds = [
  "nd-alphax",
  "ndo-search-explore",
  "nexus-dashboard-unified-backup-restore",
  "ndo-l4l7-service-chaining",
  "aci-advanced-pbr",
  "codeshift-cicd-platform",
  "resource-allocation-manager",
  "kollect-curi-knowledge-bot",
  "ucs-config-tool",
  "dementia-detection-ieee",
  "flikrify",
  "telegram-data-storage",
] as const;

const recognitionIds = [
  "priyanka-181224",
  "damo-211224",
  "srid-181024",
  "alfan-141124",
  "rohi-171024",
  "atul-180724",
  "rohi-110624",
  "srid-010424",
  "rohi-100324",
  "maru-181023",
  "moulie-120723",
  "ara-290923",
  "rohi-270923",
  "mou-120723",
  "pal-050723",
  "ara-020723",
  "rohi-030523",
  "pra-080323",
  "rohi-240123",
  "ash-290922",
  "ana-230922",
  "pra-140622",
  "mad-260522",
  "mad-230422",
  "yogi-070422",
] as const;

const careerIds = [
  "cisco-software-engineer-iii",
  "cisco-software-engineer-ii",
  "cisco-staff-engineer-intern",
  "cisco-intern",
] as const;

const expertiseIds = [
  "backend-systems",
  "generative-ai",
  "devops-automation",
  "engineering-tools",
] as const;

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function expectUnique(ids: readonly string[]): void {
  expect(new Set(ids).size).toBe(ids.length);
}

function publicAssetPath(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

function relativeToBase(assetPath: string): string {
  expect(assetPath.startsWith(import.meta.env.BASE_URL)).toBe(true);
  return assetPath.slice(import.meta.env.BASE_URL.length);
}

function expectedRecognitionImage(
  id: string,
  title: string,
  height: number,
  highlightOrder: number | null = null,
) {
  return {
    id,
    alt: `Recognition: ${title}`,
    path: `assets/images/recognition/${id}.jpeg`,
    sources: [],
    width: 1600,
    height,
    highlightOrder,
  };
}

describe("typed portfolio content", () => {
  it("preserves the public profile facts and intentional hero actions", () => {
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
    expect("footerAttributionUrl" in profile).toBe(false);
  });

  it("keeps every active record in exact source order", () => {
    expect(projects.map(({ id }) => id)).toEqual(projectIds);
    expect(recognitions.map(({ id }) => id)).toEqual(recognitionIds);
    expect(careerEntries.map(({ id }) => id)).toEqual(careerIds);
    expect(expertiseAreas.map(({ id }) => id)).toEqual(expertiseIds);

    expect(projects).toHaveLength(12);
    expect(recognitions).toHaveLength(25);
    expect(careerEntries).toHaveLength(4);
    expect(expertiseAreas).toHaveLength(4);
    expect(impactMetrics).toHaveLength(4);

    expectUnique(projects.map(({ id }) => id));
    expectUnique(recognitions.map(({ id }) => id));
    expectUnique(careerEntries.map(({ id }) => id));
    expectUnique(expertiseAreas.map(({ id }) => id));
    expectUnique(impactMetrics.map(({ id }) => id));
  });

  it("preserves the four evidence-backed impact metrics", () => {
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
  });

  it("uses only approved project destinations and selections", () => {
    expect(
      projects.flatMap((project) =>
        "featuredOrder" in project
          ? [{ id: project.id, featuredOrder: project.featuredOrder }]
          : [],
      ),
    ).toEqual([
      { id: "ndo-search-explore", featuredOrder: 1 },
      { id: "nexus-dashboard-unified-backup-restore", featuredOrder: 2 },
      { id: "ndo-l4l7-service-chaining", featuredOrder: 3 },
      { id: "resource-allocation-manager", featuredOrder: 4 },
    ]);

    expect(
      projects.map((project) => ({
        id: project.id,
        featuredOrder: "featuredOrder" in project ? project.featuredOrder : null,
        publicUrl: "publicUrl" in project ? project.publicUrl : null,
      })),
    ).toEqual([
      { id: "nd-alphax", featuredOrder: null, publicUrl: null },
      { id: "ndo-search-explore", featuredOrder: 1, publicUrl: null },
      {
        id: "nexus-dashboard-unified-backup-restore",
        featuredOrder: 2,
        publicUrl: null,
      },
      { id: "ndo-l4l7-service-chaining", featuredOrder: 3, publicUrl: null },
      { id: "aci-advanced-pbr", featuredOrder: null, publicUrl: null },
      { id: "codeshift-cicd-platform", featuredOrder: null, publicUrl: null },
      { id: "resource-allocation-manager", featuredOrder: 4, publicUrl: null },
      { id: "kollect-curi-knowledge-bot", featuredOrder: null, publicUrl: null },
      { id: "ucs-config-tool", featuredOrder: null, publicUrl: null },
      { id: "dementia-detection-ieee", featuredOrder: null, publicUrl: null },
      { id: "flikrify", featuredOrder: null, publicUrl: null },
      {
        id: "telegram-data-storage",
        featuredOrder: null,
        publicUrl: "https://github.com/umeshmg27/Telegram-as-Data-Storage",
      },
    ]);

    const linkedProjects = projects.filter((project) => "publicUrl" in project);
    expect(linkedProjects).toEqual([
      expect.objectContaining({
        id: "telegram-data-storage",
        publicUrl: "https://github.com/umeshmg27/Telegram-as-Data-Storage",
      }),
    ]);
    expect(
      projects.every(
        (project) => !("publicUrl" in project) || String(project.publicUrl) !== "#",
      ),
    ).toBe(true);

    expect(projects.find(({ id }) => id === "ndo-l4l7-service-chaining")?.image).toMatchObject({
      kind: "remote",
      src: expect.stringContaining("nb-06-mso-so-cte-en_0.png"),
    });
    expect(projects.find(({ id }) => id === "aci-advanced-pbr")?.image).toMatchObject({
      kind: "remote",
      src: expect.stringContaining("white-paper-c11-743107_11.png"),
    });
  });

  it("preserves project prose with only the approved ND-AlphaX cleanup", () => {
    expect(sha256(projects.map(({ title, description }) => ({ title, description })))).toBe(
      "d655a4093749f15a99408b07c7a7f6d002b7737f1a42fbc5e90be0c8881935c3",
    );
    expect(projects.map(({ id, image }) => ({ id, image }))).toEqual([
      {
        id: "nd-alphax",
        image: {
          kind: "local",
          alt: "ND- AlphaX",
          fallbackSrc: publicAssetPath("assets/images/data-center.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
      {
        id: "ndo-search-explore",
        image: {
          kind: "local",
          alt: "NDO Search & Explore feature",
          fallbackSrc: publicAssetPath("assets/images/search-and-explore.jpg"),
          sources: [],
          width: 2048,
          height: 2048,
        },
      },
      {
        id: "nexus-dashboard-unified-backup-restore",
        image: {
          kind: "local",
          alt: "Unified Backup and Restore - Cisco Nexus Dashboard",
          fallbackSrc: publicAssetPath("assets/images/restore.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
      {
        id: "ndo-l4l7-service-chaining",
        image: {
          kind: "remote",
          alt: "Cisco NDO - Simplified L4L7 Service Chaining",
          src: "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png",
          width: 1935,
          height: 998,
        },
      },
      {
        id: "aci-advanced-pbr",
        image: {
          kind: "remote",
          alt: "Cisco ACI - Advanced PBR Features",
          src: "https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/white-paper-c11-743107.docx/_jcr_content/renditions/white-paper-c11-743107_11.png",
          width: 904,
          height: 532,
        },
      },
      {
        id: "codeshift-cicd-platform",
        image: {
          kind: "local",
          alt: "Codeshift - CI/CD Platform",
          fallbackSrc: publicAssetPath("assets/images/codeshift.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
      {
        id: "resource-allocation-manager",
        image: {
          kind: "local",
          alt: "Resource Allocation Manager (RAM)",
          fallbackSrc: expectedResourceAllocationManagerFallbackSrc,
          sources: [],
          width: 1700,
          height: 1120,
        },
      },
      {
        id: "kollect-curi-knowledge-bot",
        image: {
          kind: "local",
          alt: "Kollect & CURI - Internal Knowledge Bot",
          fallbackSrc: expectedKollectCuriFallbackSrc,
          sources: [],
          width: 1700,
          height: 1120,
        },
      },
      {
        id: "ucs-config-tool",
        image: {
          kind: "local",
          alt: "UCS Config Tool",
          fallbackSrc: publicAssetPath("assets/images/config.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
      {
        id: "dementia-detection-ieee",
        image: {
          kind: "local",
          alt: "Dementia Detection via EEG (IEEE)",
          fallbackSrc: publicAssetPath("assets/images/ieee.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
      {
        id: "flikrify",
        image: {
          kind: "local",
          alt: "Flikrify",
          fallbackSrc: publicAssetPath("assets/images/flikr.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
      {
        id: "telegram-data-storage",
        image: {
          kind: "local",
          alt: "Telegram as Data Storage",
          fallbackSrc: publicAssetPath("assets/images/telegram.png"),
          sources: [],
          width: 1920,
          height: 1080,
        },
      },
    ]);
  });

  it("preserves recognition records, categories, and approved highlights", () => {
    const categoryCounts = Object.fromEntries(
      ["Innovation", "Mentorship", "Leadership"].map((category) => [
        category,
        recognitions.filter((recognition) => recognition.category === category).length,
      ]),
    );
    expect(categoryCounts).toEqual({ Innovation: 14, Mentorship: 5, Leadership: 6 });

    expect(
      recognitions.flatMap((recognition) =>
        "highlightOrder" in recognition
          ? [{ id: recognition.id, highlightOrder: recognition.highlightOrder }]
          : [],
      ),
    ).toEqual([
      { id: "priyanka-181224", highlightOrder: 3 },
      { id: "rohi-171024", highlightOrder: 5 },
      { id: "ara-290923", highlightOrder: 6 },
      { id: "pal-050723", highlightOrder: 1 },
      { id: "pra-080323", highlightOrder: 4 },
      { id: "yogi-070422", highlightOrder: 2 },
    ]);

    expect(
      recognitions.map(({ id, image, ...recognition }) => ({
        id,
        alt: image.alt,
        path: relativeToBase(image.fallbackSrc),
        sources: image.sources,
        width: image.width,
        height: image.height,
        highlightOrder:
          "highlightOrder" in recognition ? recognition.highlightOrder : null,
      })),
    ).toEqual([
      expectedRecognitionImage("priyanka-181224", "Cisco KT Sessions", 1158, 3),
      expectedRecognitionImage("damo-211224", "Ownership towards NDO ESG triages", 1166),
      expectedRecognitionImage("srid-181024", "Release ownership and triages", 1153),
      expectedRecognitionImage("alfan-141124", "The right help at the right time", 1163),
      expectedRecognitionImage("rohi-171024", "Feature Ownership", 1158, 5),
      expectedRecognitionImage("atul-180724", "Driving ESG IT", 1159),
      expectedRecognitionImage("rohi-110624", "Contribution to ESG feature IT", 1152),
      expectedRecognitionImage(
        "srid-010424",
        "Thank you for excellent work on Restore feature",
        1167,
      ),
      expectedRecognitionImage(
        "rohi-100324",
        "Thank you for excellent work on Backup & Restore feature",
        1160,
      ),
      expectedRecognitionImage("maru-181023", "Team Player", 1159),
      expectedRecognitionImage("moulie-120723", "Internal Tools Development", 1159),
      expectedRecognitionImage("ara-290923", "Root Cause Analysis and Release", 1156, 6),
      expectedRecognitionImage("rohi-270923", "Development test and RCA", 1162),
      expectedRecognitionImage("mou-120723", "Driving ESG IT", 1159),
      expectedRecognitionImage(
        "pal-050723",
        "Congratulations on winning 2023 Asia-Pacific Stevie Bronze award",
        1162,
        1,
      ),
      expectedRecognitionImage(
        "ara-020723",
        "Onboarding and ramping up with different codebases",
        1156,
      ),
      expectedRecognitionImage(
        "rohi-030523",
        "Onboarding and ramping up with different codebases",
        1158,
      ),
      expectedRecognitionImage("pra-080323", "Training interns", 1159, 4),
      expectedRecognitionImage("rohi-240123", "Onboarding and ramping up", 1163),
      expectedRecognitionImage("ash-290922", "Innovation: Internal Tool", 1155),
      expectedRecognitionImage("ana-230922", "Innovation: Internal Tool", 1153),
      expectedRecognitionImage("pra-140622", "Innovation: Internal Tool", 1163),
      expectedRecognitionImage("mad-260522", "Innovation: Internal Tool", 1161),
      expectedRecognitionImage("mad-230422", "Innovation: Internal Tool", 1157),
      expectedRecognitionImage("yogi-070422", "Innovation: Internal Tool", 1159, 2),
    ]);

    expect(recognitions.find(({ id }) => id === "moulie-120723")?.tags).toEqual([
      "Leadership, Mentorship, Team Player",
    ]);
    expect(recognitions.find(({ id }) => id === "mou-120723")?.id).not.toBe(
      recognitions.find(({ id }) => id === "moulie-120723")?.id,
    );
    expect(sha256(recognitions.map(({ description }) => description))).toBe(
      "9cc28e43b9d0cca80e30827b930df8a15b1cd0d3ecdff8fa1781680b2efb2b7b",
    );
    expect(sha256(recognitions.map(({ title }) => title))).toBe(
      "53d92fc57cb4c4448e11423635974baeb48fd0a7bd6dd7cc9e8067064227067f",
    );
    expect(sha256(recognitions.map(({ tags, category }) => ({ tags, category })))).toBe(
      "f281646936a724c4b1cb72c78112056886e5f9cc4cee2e37642cca8e593b604f",
    );
    for (const recognition of recognitions) {
      expect(recognition.image.fallbackSrc.split("/").at(-1)).toBe(
        `${recognition.id}.jpeg`,
      );
    }
  });

  it("preserves expertise copy, labels, and both publication URLs", () => {
    expect(
      sha256(expertiseAreas.map(({ title, description }) => ({ title, description }))),
    ).toBe("d02711c59aeebcc51a363899fe2470596dbfd8e1a425db83745acf629256106c");

    const publicationUrls = expertiseAreas.flatMap(({ items }) =>
      items.flatMap((item) => ("url" in item ? [item.url] : [])),
    );
    expect(publicationUrls).toEqual([
      "https://www.tdcommons.org/dpubs_series/7086/",
      "https://www.tdcommons.org/dpubs_series/7085/",
    ]);
    expect(
      expertiseAreas.map(({ id, title, itemsLabel, items }) => ({
        id,
        title,
        itemsLabel,
        items: items.map((item) => ({
          label: item.label,
          url: "url" in item ? item.url : null,
        })),
      })),
    ).toEqual([
      {
        id: "backend-systems",
        title: "Backend Engineer - Distributed Systems & Infrastructure",
        itemsLabel: "Tech stack:",
        items: [
          { label: "Golang", url: null },
          { label: "Python", url: null },
          { label: "C++", url: null },
          { label: "MongoDB", url: null },
          { label: "Redis", url: null },
        ],
      },
      {
        id: "generative-ai",
        title: "Exploring Generative AI & LLMs",
        itemsLabel: "Tech stack & Papers:",
        items: [
          {
            label: "SMALL LLMS FOR EDGE COMPUTING",
            url: "https://www.tdcommons.org/dpubs_series/7086/",
          },
          {
            label: "MULTI-STAGE FINE-TUNING PROCESS",
            url: "https://www.tdcommons.org/dpubs_series/7085/",
          },
          { label: "LangChain", url: null },
          { label: "RAG", url: null },
          { label: "Hugging Face", url: null },
          { label: "LlamaIndex", url: null },
          { label: "Streamlit", url: null },
        ],
      },
      {
        id: "devops-automation",
        title: "DevOps & Automation",
        itemsLabel: "Tech stack:",
        items: [
          { label: "SonarQube", url: null },
          { label: "Docker", url: null },
          { label: "Kubernetes", url: null },
          { label: "Linux", url: null },
        ],
      },
      {
        id: "engineering-tools",
        title: "Tools",
        itemsLabel: "Tech stack:",
        items: [
          { label: "VS Code", url: null },
          { label: "Postman", url: null },
          { label: "pprof", url: null },
          { label: "Hugging Face", url: null },
          { label: "LlamaIndex", url: null },
          { label: "Streamlit", url: null },
        ],
      },
    ]);
  });

  it("preserves the rendered career dates, employer, location, and 300+ hours claim", () => {
    expect(careerEntries).toEqual([
      {
        id: "cisco-software-engineer-iii",
        role: "Software Engineer III",
        organization: "Cisco Systems",
        location: "IN",
        period: "Aug 2024 – Present",
        summary: "Network Backend development, GenAI/LLM, Mentorship and Feature owner",
        technologies: [],
        highlights: [],
      },
      {
        id: "cisco-software-engineer-ii",
        role: "Software Engineer II",
        organization: "Cisco Systems",
        location: "IN",
        period: "Aug 2022 – Jul 2024",
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
        period: "Aug 2021 – Jul 2022",
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
        period: "Jan 2021 – Jul 2021",
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
    expect(
      careerEntries.find(({ id }) => id === "cisco-staff-engineer-intern")?.highlights,
    ).toContain("Automated multiserver configurations saving 300+ hours");
  });

  it("keeps all required full content and image metadata nonempty", () => {
    for (const project of projects) {
      expect(project.title.trim()).not.toBe("");
      expect(project.description.trim()).not.toBe("");
      expect(project.image.alt.trim()).not.toBe("");
      expect(project.image.width).toBeGreaterThan(0);
      expect(project.image.height).toBeGreaterThan(0);
    }

    for (const recognition of recognitions) {
      expect(recognition.title.trim()).not.toBe("");
      expect(recognition.description.trim()).not.toBe("");
      expect(recognition.tags.length).toBeGreaterThan(0);
      expect(recognition.image.alt.trim()).not.toBe("");
    }

    for (const entry of careerEntries) {
      expect(entry.role.trim()).not.toBe("");
      expect(entry.organization.trim()).not.toBe("");
      expect(entry.location.trim()).not.toBe("");
      expect(entry.period.trim()).not.toBe("");
      expect(
        ("summary" in entry ? entry.summary.trim().length : 0) +
          entry.technologies.length +
          entry.highlights.length,
      ).toBeGreaterThan(0);
    }

    for (const area of expertiseAreas) {
      expect(area.title.trim()).not.toBe("");
      expect(area.description.trim()).not.toBe("");
      expect(area.items.length).toBeGreaterThan(0);
      expect(area.items.every(({ label }) => label.trim() !== "")).toBe(true);
    }
  });

  it("resolves every transitional local asset through the configured Vite base", () => {
    const baseUrl = import.meta.env.BASE_URL;
    const localImages = [
      profile.portrait,
      ...projects.flatMap(({ image }) => (image.kind === "local" ? [image] : [])),
      ...recognitions.map(({ image }) => image),
    ];

    for (const image of localImages) {
      expect(image.fallbackSrc.startsWith(baseUrl)).toBe(true);
      expect(image.sources).toEqual([]);
    }

    const publicProjectFallbacks = projects.flatMap(({ id, image }) =>
      image.kind === "local" &&
      !["resource-allocation-manager", "kollect-curi-knowledge-bot"].includes(id)
        ? [image.fallbackSrc]
        : [],
    );
    expect(
      publicProjectFallbacks.every((src) => src.startsWith(`${baseUrl}assets/images/`)),
    ).toBe(true);
    expect(
      recognitions.every(({ image }) =>
        image.fallbackSrc.startsWith(`${baseUrl}assets/images/recognition/`),
      ),
    ).toBe(true);

    expect(profile.portrait.fallbackSrc).toBe(expectedPortraitFallbackSrc);
    expect(
      projects.find(({ id }) => id === "resource-allocation-manager")?.image,
    ).toMatchObject({ fallbackSrc: expectedResourceAllocationManagerFallbackSrc });
    expect(projects.find(({ id }) => id === "kollect-curi-knowledge-bot")?.image).toMatchObject({
      fallbackSrc: expectedKollectCuriFallbackSrc,
    });
    expect(expectedPortraitFallbackSrc.startsWith("/assets/")).toBe(false);
    expect(expectedResourceAllocationManagerFallbackSrc.startsWith("/assets/")).toBe(false);
    expect(expectedKollectCuriFallbackSrc.startsWith("/assets/")).toBe(false);
  });

  it("composes public asset fallbacks with a non-root configured base", async () => {
    const configuredBase = "/portable-preview/";
    const repositoryBase = new URL(profile.canonicalUrl).pathname;

    expect(configuredBase).not.toBe(import.meta.env.BASE_URL);
    expect(configuredBase).not.toBe(repositoryBase);
    vi.stubEnv("BASE_URL", configuredBase);
    vi.resetModules();

    try {
      const [{ projects: basedProjects }, { recognitions: basedRecognitions }] =
        await Promise.all([import("./projects"), import("./recognitions")]);
      const publicProjectFallbacks = basedProjects.flatMap(({ id, image }) =>
        image.kind === "local" &&
        !["resource-allocation-manager", "kollect-curi-knowledge-bot"].includes(id)
          ? [image.fallbackSrc]
          : [],
      );

      expect(
        publicProjectFallbacks.every((src) =>
          src.startsWith(`${configuredBase}assets/images/`),
        ),
      ).toBe(true);
      expect(
        basedRecognitions.every(({ image }) =>
          image.fallbackSrc.startsWith(`${configuredBase}assets/images/recognition/`),
        ),
      ).toBe(true);

      const publicFallbacks = [
        ...publicProjectFallbacks,
        ...basedRecognitions.map(({ image }) => image.fallbackSrc),
      ];
      expect(publicFallbacks.some((src) => src.startsWith("/assets/"))).toBe(false);
      expect(publicFallbacks.some((src) => src.startsWith(repositoryBase))).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
