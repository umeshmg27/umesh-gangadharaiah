import type { CareerEntry } from "./models";

export const careerEntries = [
  {
    id: "cisco-senior-software-engineer",
    role: "Senior Software Engineer",
    organization: "Cisco Systems",
    location: "IN",
    period: "Oct 2025 – Present",
    summary:
      "Helping engineers plan, build, validate, and support software with reusable AI-assisted workflows",
    technologies: [
      "AI Agents",
      "Reusable Skills",
      "Model Context Protocol (MCP)",
      "Developer Automation",
    ],
    highlights: [
      "My role has grown from delivering backend features to improving how engineers across the team approach feature delivery and defect resolution",
      "I build reusable agents, Skills, and MCP integrations around recurring day-to-day engineering work, then refine them through hands-on use",
      "I help engineers adopt these workflows while keeping technical judgment, code review, and release decisions firmly human-owned",
      "Engineers using these workflows have reported up to 5–6× higher defect-resolution throughput, both individually and across their teams",
    ],
  },
  {
    id: "cisco-software-engineer-iii",
    role: "Software Engineer III",
    organization: "Cisco Systems",
    location: "IN",
    period: "Aug 2024 – Sep 2025",
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
] as const satisfies readonly CareerEntry[];

export type CareerEntryId = (typeof careerEntries)[number]["id"];
