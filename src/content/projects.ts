import type { LocalImageAsset, Project } from "./models";

const projectAssetUrls = import.meta.glob<string>(
  "../assets/portfolio/projects/*.{jpg,png,webp}",
  { eager: true, import: "default", query: "?url" },
);

function projectAsset(fileName: string): string {
  const asset = projectAssetUrls[`../assets/portfolio/projects/${fileName}`];
  if (!asset) throw new Error(`Missing imported project asset: ${fileName}`);
  return asset;
}

function localProjectImage(
  id: string,
  fallbackExtension: "jpg" | "png",
  alt: string,
  width: number,
  height: number,
): LocalImageAsset {
  return {
    kind: "local",
    alt,
    fallbackSrc: projectAsset(`${id}.${fallbackExtension}`),
    sources: [
      {
        src: projectAsset(`${id}-640.webp`),
        width: 640,
        type: "image/webp",
      },
      {
        src: projectAsset(`${id}-960.webp`),
        width: 960,
        type: "image/webp",
      },
    ],
    width,
    height,
  };
}

export const projects = [
  {
    id: "nd-nexusone",
    title: "ND — NexusOne",
    description:
      "I helped design and deliver a key data-center networking capability for NexusOne, serving as a backend code owner. I used agent-assisted planning, documentation, and validation to help move the work from early design through release, alongside core backend implementation, automated testing, and reliability hardening. I’ve generalized the details here and left out internal architecture, interfaces, repositories, release information, and operational data.",
    image: localProjectImage(
      "nd-nexusone",
      "png",
      "Rows of servers in a modern data center",
      1920,
      1080,
    ),
    capabilities: [
      "Backend code ownership",
      "Agent-assisted planning",
      "Living documentation",
      "Release validation",
    ],
    abstracted: true,
    featuredOrder: 1,
  },
  {
    id: "ndo-search-explore",
    title: "NDO - Search & Explore Feature",
    description:
      "Designed and implemented an advanced Search & Explore feature for Cisco NDO's configurable policy objects while leading a team of two. Engineered efficient indexing strategies across multiple MongoDB collections to enable high-speed autocomplete and deep object retrieval. Optimized query execution by extending search capabilities across three distinct collections with unified logic. Conducted extensive scalability testing with datasets of over 50,000 policy objects, consistently achieving retrieval times under one second, ensuring robust performance in production-scale environments.",
    image: localProjectImage(
      "ndo-search-explore",
      "jpg",
      "NDO Search & Explore feature",
      2048,
      2048,
    ),
    featuredOrder: 2,
  },
  {
    id: "nexus-dashboard-unified-backup-restore",
    title: "Unified Backup and Restore - Cisco Nexus Dashboard",
    description:
      "Designed and implemented a clean backup and restore workflow for Cisco’s Unified Product Suite, covering NDO, NDI, and NDFC. Leveraged Kubernetes ConfigMaps to communicate real-time status between services during backup and restore operations. Performed extensive validation of backup archives to ensure integrity and consistency across product configurations. Utilized Golang goroutines to enable concurrent restore tasks, allowing seamless and efficient parallel recovery of components from a single backup source—significantly improving resilience and reducing recovery time in production environments.",
    image: localProjectImage(
      "nexus-dashboard-unified-backup-restore",
      "png",
      "Unified Backup and Restore - Cisco Nexus Dashboard",
      1920,
      1080,
    ),
    featuredOrder: 3,
  },
  {
    id: "ndo-l4l7-service-chaining",
    title: "Cisco NDO - Simplified L4L7 Service Chaining",
    description:
      "Part of the development team focused on simplifying L4-L7 service chaining across sites using Cisco's Nexus Dashboard Orchestrator (NDO). Worked on validating user configurations and converting them into APIC Managed Object (MO) API requests. Contributed significantly to two distinct microservices within the NDO ecosystem, ensuring seamless orchestration and integration.",
    image: {
      kind: "remote",
      alt: "Cisco NDO - Simplified L4L7 Service Chaining",
      src: "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png",
      width: 1935,
      height: 998,
    },
    featuredOrder: 4,
  },
  {
    id: "aci-advanced-pbr",
    title: "Cisco ACI - Advanced PBR Features",
    description:
      "Contributed to feature development of Service Graphs in ACI, including Symmetric, Intra-VRF, and Location-Aware PBR. Delivered scalable and secure traffic redirection solutions integrated with firewalls and load balancers.",
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
    title: "Codeshift - CI/CD Platform",
    description:
      "Developed a Continuous Delivery platform to deploy internal applications with FastAPI and React. Created REST APIs for VM and resource allocation, reducing manual deployment effort by 70%.",
    image: localProjectImage(
      "codeshift-cicd-platform",
      "png",
      "Codeshift - CI/CD Platform",
      1920,
      1080,
    ),
  },
  {
    id: "resource-allocation-manager",
    title: "Resource Allocation Manager (RAM)",
    description:
      "Designed and developed RAM—an internal tool for project staffing. Reduced overhead tasks by 40% and cut allocation time by 60%. Awarded Bronze Stevie for innovation in HR software.",
    image: localProjectImage(
      "resource-allocation-manager",
      "png",
      "Resource Allocation Manager (RAM)",
      1700,
      1120,
    ),
  },
  {
    id: "kollect-curi-knowledge-bot",
    title: "Kollect & CURI - Internal Knowledge Bot",
    description:
      "Led a 5-person team to build a chatbot that parses internal Webex threads and indexes team knowledge. Integrated with MongoDB, Docker, and webhooks to track team queries efficiently.",
    image: localProjectImage(
      "kollect-curi-knowledge-bot",
      "png",
      "Kollect & CURI - Internal Knowledge Bot",
      1700,
      1120,
    ),
  },
  {
    id: "ucs-config-tool",
    title: "UCS Config Tool",
    description:
      "Proposed and built a tool to automate UCS server configurations. Enabled configuration of banners, DNS, SNMP, logs, etc., and generated formatted reports for customers using React and Python.",
    image: localProjectImage(
      "ucs-config-tool",
      "png",
      "UCS Config Tool",
      1920,
      1080,
    ),
  },
  {
    id: "dementia-detection-ieee",
    title: "Dementia Detection via EEG (IEEE)",
    description:
      "Co-authored and published a research paper on dementia detection through EEG analysis. Presented at IEEE conference with promising accuracy using early-stage patient data.",
    image: localProjectImage(
      "dementia-detection-ieee",
      "png",
      "Dementia Detection via EEG (IEEE)",
      1920,
      1080,
    ),
  },
  {
    id: "flikrify",
    title: "Flikrify",
    description:
      "Lead Backend Developer for a cross-platform social app focused on simplifying group communication. Designed and launched in 5 months using Golang, Redis, ArangoDB, and GenAI. Live on Android, iOS, and MacOS.",
    image: localProjectImage("flikrify", "png", "Flikrify", 1920, 1080),
  },
  {
    id: "telegram-data-storage",
    title: "Telegram as Data Storage",
    description:
      "Personal project that uses Telegram chats as an ad-hoc storage service. Designed as a lightweight backup system for data dump using Telegram APIs and automation.",
    image: localProjectImage(
      "telegram-data-storage",
      "png",
      "Telegram as Data Storage",
      1920,
      1080,
    ),
    publicUrl: "https://github.com/umeshmg27/Telegram-as-Data-Storage",
  },
  {
    id: "agentic-engineering-automation",
    title: "AI-Assisted Engineering Workflows",
    description:
      "I’ve built and used an engineering approach that combines AI agents, reusable Skills, and a few MCP integrations. I use it to investigate bugs, plan features, write practical engineering guides, and build simulations that help validate behavior. People still review the evidence, decisions, and changes. For defect resolution, the reported throughput improvement is up to 5–6× for individual engineers and the wider team. I’ve left out identifying names and implementation details so I can share the approach publicly.",
    image: {
      kind: "abstract",
      alt: "Abstract workflow connecting AI agents, reusable Skills, and context integration",
      labels: ["Agents", "Skills", "MCP"],
    },
    capabilities: [
      "AI Agents",
      "Reusable Skills",
      "Model Context Protocol",
      "Multi-agent orchestration",
      "Evidence-led RCA",
      "Human approval gates",
      "Automated validation",
    ],
    flows: [
      {
        id: "defect-resolution",
        title: "Finding and fixing bugs",
        path: "Issue context → Evidence → Root cause → Validation",
        summary:
          "I use agents to organize sanitized evidence, test competing explanations, and turn the strongest one into a human-reviewed root cause and validated fix plan.",
      },
      {
        id: "feature-planning",
        title: "Planning features before coding",
        path: "Feature request → Existing behavior → Delivery plan → Tests",
        summary:
          "I map current behavior, dependencies, and trade-offs before turning a feature request into an implementation-ready plan and test strategy.",
      },
      {
        id: "living-documentation",
        title: "Documenting complex systems",
        path: "Verified behavior → System map → Practical guide",
        summary:
          "I turn verified source behavior into practical guides covering architecture, state, failure paths, operations, and debugging.",
      },
      {
        id: "simulation-validation",
        title: "Simulating and validating behavior",
        path: "Synthetic scenario → Simulation → Validation evidence",
        summary:
          "I build deterministic browser simulations with synthetic scenarios so engineers can explore state changes, edge cases, and regressions safely.",
      },
    ],
    abstracted: true,
  },
] as const satisfies readonly Project[];

export type ProjectId = (typeof projects)[number]["id"];
