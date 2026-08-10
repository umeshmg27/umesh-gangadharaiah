import type { CareerEntry } from "./models";

export const careerEntries = [
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
] as const satisfies readonly CareerEntry[];

export type CareerEntryId = (typeof careerEntries)[number]["id"];
