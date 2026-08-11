import {
  ArrowRight,
  Clock3,
  Search,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import {
  impactMetrics,
  type ImpactMetricId,
} from "../content/impact";
import styles from "./ImpactSummary.module.css";

type ImpactOutcome = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly metricIds: readonly ImpactMetricId[];
  readonly linkLabel: string;
  readonly href: string;
  readonly icon: LucideIcon;
};

const impactOutcomes = [
  {
    id: "ndo-search-explore",
    title: "NDO Search & Explore",
    summary:
      "Indexed production-scale policy data while keeping retrieval under one second.",
    metricIds: ["policy-objects-indexed", "policy-retrieval-speed"],
    linkLabel: "View Search & Explore project",
    href: "#project-ndo-search-explore",
    icon: Search,
  },
  {
    id: "configuration-automation",
    title: "Multiserver configuration automation",
    summary:
      "Automated multiserver configurations during my Staff Engineer internship.",
    metricIds: ["manual-hours-saved"],
    linkLabel: "View career milestone",
    href: "#career-cisco-staff-engineer-intern",
    icon: Clock3,
  },
  {
    id: "codeshift-cicd-platform",
    title: "Codeshift CI/CD platform",
    summary:
      "Created APIs for VM and resource allocation, reducing manual deployment effort.",
    metricIds: ["manual-effort-reduced"],
    linkLabel: "View Codeshift project",
    href: "#project-codeshift-cicd-platform",
    icon: Workflow,
  },
] as const satisfies readonly ImpactOutcome[];

function metricById(metricId: ImpactMetricId) {
  const metric = impactMetrics.find(({ id }) => id === metricId);
  if (!metric) throw new Error(`Missing impact metric: ${metricId}`);
  return metric;
}

export default function ImpactSummary() {
  return (
    <section aria-labelledby="impact-heading" className={styles.section}>
      <div className={styles.introduction}>
        <div>
          <p className={styles.eyebrow}>Selected outcomes</p>
          <h2 className={styles.heading} id="impact-heading">
            Impact
          </h2>
        </div>
        <p className={styles.explanation}>
          Each result connects the number to the work that produced it.
        </p>
      </div>

      <ul className={styles.outcomes}>
        {impactOutcomes.map((outcome) => {
          const Icon = outcome.icon;

          return (
            <li
              className={styles.outcome}
              data-impact-outcome-id={outcome.id}
              key={outcome.id}
            >
              <div aria-hidden="true" className={styles.icon}>
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className={styles.outcomeTitle}>{outcome.title}</h3>
              <div className={styles.metrics}>
                {outcome.metricIds.map((metricId) => {
                  const metric = metricById(metricId);
                  return (
                    <span className={styles.metric} key={metric.id}>
                      <strong className={styles.value}>{metric.value}</strong>
                      <span className={styles.label}>{metric.label}</span>
                    </span>
                  );
                })}
              </div>
              <p className={styles.summary}>{outcome.summary}</p>
              <a className={styles.sourceLink} href={outcome.href}>
                {outcome.linkLabel}
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
