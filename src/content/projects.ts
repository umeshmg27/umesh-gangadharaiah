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
    id: "nd-alphax",
    title: "ND- AlphaX",
    description:
      "Part of the design team, developing a key product feature that would shape the future of data center networking.",
    image: localProjectImage("nd-alphax", "png", "ND- AlphaX", 1920, 1080),
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
    featuredOrder: 1,
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
    featuredOrder: 2,
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
    featuredOrder: 3,
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
    featuredOrder: 4,
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
    title: "Agentic Engineering Automation",
    description:
      "Helped establish and evolve an agentic engineering foundation by designing selected Model Context Protocol integrations and applying reusable Skills and specialist-agent workflows. The system turns sanitized issue context into scoped evidence, competing hypotheses, human-reviewed root causes, validated change options, and review-ready technical handoffs; the same building blocks support feature delivery and day-to-day engineering, with reported gains of up to 5–6× in bug-resolution throughput for individual engineers and the wider team. This public case study intentionally omits proprietary product names, repositories, customer information, operational data, and implementation details.",
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
        title: "Evidence-led defect resolution",
        path:
          "Sanitized issue → Evidence and hypotheses → Reviewed RCA and validation",
        summary:
          "Agents turn sanitized issue context into scoped evidence, competing hypotheses, human-reviewed root causes, and validated resolution handoffs.",
      },
      {
        id: "feature-planning",
        title: "Agent-assisted feature planning",
        path:
          "Feature brief → System model and options → Implementation plan and tests",
        summary:
          "Agent-assisted analysis maps current behavior, compares design options, surfaces dependencies and risks, and produces implementation-ready plans with a test strategy.",
      },
      {
        id: "living-documentation",
        title: "Living system documentation",
        path:
          "Verified behavior → Connected system model → Living engineering guide",
        summary:
          "Reusable Skills keep architecture, interfaces, state, lifecycle, failure behavior, and verification guidance discoverable for engineers and agents.",
      },
      {
        id: "simulation-validation",
        title: "Interactive simulation & validation",
        path:
          "Synthetic scenario → Deterministic model → Reviewable validation evidence",
        summary:
          "Deterministic browser simulations use synthetic scenarios to explain state transitions, exercise edge cases, and support human-reviewed validation.",
      },
    ],
    abstracted: true,
  },
] as const satisfies readonly Project[];

export type ProjectId = (typeof projects)[number]["id"];
