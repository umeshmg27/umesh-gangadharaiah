/// <reference types="node" />

import { createHash } from "node:crypto";

import { careerEntries } from "./career";
import { expertiseAreas } from "./expertise";
import { impactMetrics } from "./impact";
import { profile } from "./profile";
import { projects } from "./projects";
import { recognitions } from "./recognitions";

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

describe("typed portfolio content", () => {
  it("preserves the public profile facts and intentional hero actions", () => {
    expect(profile).toMatchObject({
      name: "Umesh Gangadharaiah",
      givenName: "Umesh",
      familyName: "Gangadharaiah",
      role: "Backend Engineer",
      specialization: "Distributed Systems & Infrastructure",
      githubUrl: "https://github.com/umeshmg27",
      linkedinUrl: "https://www.linkedin.com/in/umeshmg/",
      canonicalUrl: "https://umeshmg27.github.io/umesh-gangadharaiah/",
      heroActions: [
        { label: "View Work", href: "#projects" },
        { label: "Contact", href: "#contact" },
      ],
    });
    expect(profile.portrait.fallbackSrc).toBe("/src/assets/images/umesh-ug.jpg");
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
      projects
        .filter((project) => "featuredOrder" in project)
        .sort((left, right) => {
          const leftOrder = "featuredOrder" in left ? left.featuredOrder : 0;
          const rightOrder = "featuredOrder" in right ? right.featuredOrder : 0;
          return leftOrder - rightOrder;
        })
        .map(({ id }) => id),
    ).toEqual([
      "ndo-search-explore",
      "nexus-dashboard-unified-backup-restore",
      "ndo-l4l7-service-chaining",
      "resource-allocation-manager",
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
    expect(
      projects.map(({ image }) =>
        image.kind === "local" ? image.fallbackSrc : image.src,
      ),
    ).toEqual([
      "/assets/images/data-center.png",
      "/assets/images/search-and-explore.jpg",
      "/assets/images/restore.png",
      "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png",
      "https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/white-paper-c11-743107.docx/_jcr_content/renditions/white-paper-c11-743107_11.png",
      "/assets/images/codeshift.png",
      "/src/assets/images/mock05.png",
      "/src/assets/images/mock04.png",
      "/assets/images/config.png",
      "/assets/images/ieee.png",
      "/assets/images/flikr.png",
      "/assets/images/telegram.png",
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
      recognitions
        .filter((recognition) => "highlightOrder" in recognition)
        .sort((left, right) => {
          const leftOrder = "highlightOrder" in left ? left.highlightOrder : 0;
          const rightOrder = "highlightOrder" in right ? right.highlightOrder : 0;
          return leftOrder - rightOrder;
        })
        .map(({ id }) => id),
    ).toEqual([
      "pal-050723",
      "yogi-070422",
      "priyanka-181224",
      "pra-080323",
      "rohi-171024",
      "ara-290923",
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
    expect(
      sha256(
        recognitions.map(({ tags, category, image }) => ({
          tags,
          category,
          fallbackSrc: image.fallbackSrc,
        })),
      ),
    ).toBe("df55ae20cba6d28f7c18103ce5286f8cae6334d7c8d33da95992201cdf7af594");
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
      expertiseAreas.map(({ items }) =>
        items.map((item) => ({ ...("url" in item ? { url: item.url } : {}), label: item.label })),
      ),
    ).toEqual([
      [
        { label: "Golang" },
        { label: "Python" },
        { label: "C++" },
        { label: "MongoDB" },
        { label: "Redis" },
      ],
      [
        {
          url: "https://www.tdcommons.org/dpubs_series/7086/",
          label: "SMALL LLMS FOR EDGE COMPUTING",
        },
        {
          url: "https://www.tdcommons.org/dpubs_series/7085/",
          label: "MULTI-STAGE FINE-TUNING PROCESS",
        },
        { label: "LangChain" },
        { label: "RAG" },
        { label: "Hugging Face" },
        { label: "LlamaIndex" },
        { label: "Streamlit" },
      ],
      [
        { label: "SonarQube" },
        { label: "Docker" },
        { label: "Kubernetes" },
        { label: "Linux" },
      ],
      [
        { label: "VS Code" },
        { label: "Postman" },
        { label: "pprof" },
        { label: "Hugging Face" },
        { label: "LlamaIndex" },
        { label: "Streamlit" },
      ],
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

  it("does not hard-code the repository slug in transitional local paths", () => {
    const localImages = [
      profile.portrait,
      ...projects.flatMap(({ image }) => (image.kind === "local" ? [image] : [])),
      ...recognitions.map(({ image }) => image),
    ];

    for (const image of localImages) {
      expect(image.fallbackSrc).not.toContain("/umesh-gangadharaiah/");
      expect(image.sources).toEqual([]);
    }
  });
});
