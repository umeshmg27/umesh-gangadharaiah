import kollectCuriFallbackSrc from "../assets/images/mock04.png";
import resourceAllocationManagerFallbackSrc from "../assets/images/mock05.png";

import type { Project } from "./models";

function publicProjectAsset(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

export const projects = [
  {
    id: "nd-alphax",
    title: "ND- AlphaX",
    description:
      "Part of the design team, developing a key product feature that would shape the future of data center networking.",
    image: {
      kind: "local",
      alt: "ND- AlphaX",
      fallbackSrc: publicProjectAsset("assets/images/data-center.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "ndo-search-explore",
    title: "NDO - Search & Explore Feature",
    description:
      "Designed and implemented an advanced Search & Explore feature for Cisco NDO's configurable policy objects while leading a team of two. Engineered efficient indexing strategies across multiple MongoDB collections to enable high-speed autocomplete and deep object retrieval. Optimized query execution by extending search capabilities across three distinct collections with unified logic. Conducted extensive scalability testing with datasets of over 50,000 policy objects, consistently achieving retrieval times under one second, ensuring robust performance in production-scale environments.",
    image: {
      kind: "local",
      alt: "NDO Search & Explore feature",
      fallbackSrc: publicProjectAsset("assets/images/search-and-explore.jpg"),
      sources: [],
      width: 2048,
      height: 2048,
    },
    featuredOrder: 1,
  },
  {
    id: "nexus-dashboard-unified-backup-restore",
    title: "Unified Backup and Restore - Cisco Nexus Dashboard",
    description:
      "Designed and implemented a clean backup and restore workflow for Cisco’s Unified Product Suite, covering NDO, NDI, and NDFC. Leveraged Kubernetes ConfigMaps to communicate real-time status between services during backup and restore operations. Performed extensive validation of backup archives to ensure integrity and consistency across product configurations. Utilized Golang goroutines to enable concurrent restore tasks, allowing seamless and efficient parallel recovery of components from a single backup source—significantly improving resilience and reducing recovery time in production environments.",
    image: {
      kind: "local",
      alt: "Unified Backup and Restore - Cisco Nexus Dashboard",
      fallbackSrc: publicProjectAsset("assets/images/restore.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
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
    image: {
      kind: "local",
      alt: "Codeshift - CI/CD Platform",
      fallbackSrc: publicProjectAsset("assets/images/codeshift.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "resource-allocation-manager",
    title: "Resource Allocation Manager (RAM)",
    description:
      "Designed and developed RAM—an internal tool for project staffing. Reduced overhead tasks by 40% and cut allocation time by 60%. Awarded Bronze Stevie for innovation in HR software.",
    image: {
      kind: "local",
      alt: "Resource Allocation Manager (RAM)",
      fallbackSrc: resourceAllocationManagerFallbackSrc,
      sources: [],
      width: 1700,
      height: 1120,
    },
    featuredOrder: 4,
  },
  {
    id: "kollect-curi-knowledge-bot",
    title: "Kollect & CURI - Internal Knowledge Bot",
    description:
      "Led a 5-person team to build a chatbot that parses internal Webex threads and indexes team knowledge. Integrated with MongoDB, Docker, and webhooks to track team queries efficiently.",
    image: {
      kind: "local",
      alt: "Kollect & CURI - Internal Knowledge Bot",
      fallbackSrc: kollectCuriFallbackSrc,
      sources: [],
      width: 1700,
      height: 1120,
    },
  },
  {
    id: "ucs-config-tool",
    title: "UCS Config Tool",
    description:
      "Proposed and built a tool to automate UCS server configurations. Enabled configuration of banners, DNS, SNMP, logs, etc., and generated formatted reports for customers using React and Python.",
    image: {
      kind: "local",
      alt: "UCS Config Tool",
      fallbackSrc: publicProjectAsset("assets/images/config.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "dementia-detection-ieee",
    title: "Dementia Detection via EEG (IEEE)",
    description:
      "Co-authored and published a research paper on dementia detection through EEG analysis. Presented at IEEE conference with promising accuracy using early-stage patient data.",
    image: {
      kind: "local",
      alt: "Dementia Detection via EEG (IEEE)",
      fallbackSrc: publicProjectAsset("assets/images/ieee.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "flikrify",
    title: "Flikrify",
    description:
      "Lead Backend Developer for a cross-platform social app focused on simplifying group communication. Designed and launched in 5 months using Golang, Redis, ArangoDB, and GenAI. Live on Android, iOS, and MacOS.",
    image: {
      kind: "local",
      alt: "Flikrify",
      fallbackSrc: publicProjectAsset("assets/images/flikr.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
  },
  {
    id: "telegram-data-storage",
    title: "Telegram as Data Storage",
    description:
      "Personal project that uses Telegram chats as an ad-hoc storage service. Designed as a lightweight backup system for data dump using Telegram APIs and automation.",
    image: {
      kind: "local",
      alt: "Telegram as Data Storage",
      fallbackSrc: publicProjectAsset("assets/images/telegram.png"),
      sources: [],
      width: 1920,
      height: 1080,
    },
    publicUrl: "https://github.com/umeshmg27/Telegram-as-Data-Storage",
  },
] as const satisfies readonly Project[];

export type ProjectId = (typeof projects)[number]["id"];
