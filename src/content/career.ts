import type { CareerEntry } from "./models";

export const careerEntries = [
  {
    id: "cisco-senior-software-engineer",
    role: "Senior Software Engineer",
    organization: "Cisco Systems",
    location: "IN",
    period: "Oct 2025 – Present",
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
    period: "Aug 2024 – Sep 2025",
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
] as const satisfies readonly CareerEntry[];

export type CareerEntryId = (typeof careerEntries)[number]["id"];
