import type { ExpertiseArea } from "./models";

export const expertiseAreas = [
  {
    id: "generative-ai",
    title: "Agentic Engineering & Applied AI",
    description:
      "I design AI-assisted engineering workflows with agents, reusable Skills, and Model Context Protocol (MCP) integrations. My focus is dependable orchestration: grounding work in traceable evidence, keeping people responsible for decisions, and turning complex engineering tasks into repeatable paths from investigation and planning through implementation and validation.",
    itemsLabel: "Focus areas & publications:",
    items: [
      { label: "AI Agents" },
      { label: "Reusable Skills" },
      { label: "Model Context Protocol" },
      { label: "LLMs" },
      { label: "Multi-Agent Orchestration" },
      {
        label: "Small LLMs for Edge Computing",
        url: "https://www.tdcommons.org/dpubs_series/7086/",
      },
      {
        label: "Multi-Stage Fine-Tuning Process",
        url: "https://www.tdcommons.org/dpubs_series/7085/",
      },
    ],
  },
  {
    id: "backend-systems",
    title: "Distributed Backend Systems",
    description:
      "I build backend services for distributed systems where consistency, recovery, and clear service boundaries matter. On NexusOne, I applied that approach to service integration, lifecycle reliability, automated validation, and release hardening as part of a broader engineering team.",
    itemsLabel: "Core stack:",
    items: [
      { label: "Golang" },
      { label: "Python" },
      { label: "C++" },
      { label: "MongoDB" },
      { label: "Redis" },
    ],
  },
  {
    id: "devops-automation",
    title: "Engineering Automation & Release Reliability",
    description:
      "I automate the work around software delivery—from repeatable environments and test pipelines to release checks and recovery workflows. I use containers, Kubernetes, Linux, and CI/CD tooling to reduce manual steps, make failures easier to reproduce, and help teams ship changes with greater confidence.",
    itemsLabel: "Core stack:",
    items: [
      { label: "Docker" },
      { label: "Kubernetes" },
      { label: "Linux" },
      { label: "CI/CD" },
      { label: "SonarQube" },
    ],
  },
  {
    id: "engineering-tools",
    title: "Validation, Debugging & Performance",
    description:
      "I treat validation as part of feature design. I build automated tests, deterministic simulations, profiling, and debugging workflows that expose edge cases early and make complex behavior easier to understand. This approach helps me investigate defects, harden distributed features, and support reliable releases.",
    itemsLabel: "Methods & tools:",
    items: [
      { label: "Automated Testing" },
      { label: "Simulation" },
      { label: "pprof" },
      { label: "Observability" },
      { label: "Postman" },
    ],
  },
] as const satisfies readonly ExpertiseArea[];

export type ExpertiseAreaId = (typeof expertiseAreas)[number]["id"];
