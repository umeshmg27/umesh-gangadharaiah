import type { ImpactMetric } from "./models";

export const impactMetrics = [
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
] as const satisfies readonly ImpactMetric[];

export type ImpactMetricId = (typeof impactMetrics)[number]["id"];
