import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Bug,
  Clock3,
  FlaskConical,
  Route,
  Search,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import {
  impactMetrics,
  type ImpactMetricId,
} from "../content/impact";
import type { Project, ProjectFlow } from "../content/models";
import { projects } from "../content/projects";
import styles from "./ImpactSummary.module.css";

type EstablishedOutcome = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly metricIds: readonly ImpactMetricId[];
  readonly linkLabel: string;
  readonly href: string;
  readonly icon: LucideIcon;
};

const projectRecords: readonly Project[] = projects;
type AgenticProject = Project & {
  readonly capabilities: readonly string[];
  readonly flows: readonly ProjectFlow[];
};

function findAgenticProject(): AgenticProject {
  const project = projectRecords.find(
    ({ id }) => id === "agentic-engineering-automation",
  );

  if (!project?.flows || !project.capabilities) {
    throw new Error("Missing agentic engineering project content");
  }

  return {
    ...project,
    capabilities: project.capabilities,
    flows: project.flows,
  };
}

const agenticProject = findAgenticProject();

const establishedOutcomes: readonly EstablishedOutcome[] = [
  {
    id: "ndo-search-explore",
    title: "Production-scale policy search",
    summary:
      "I indexed more than 50,000 policy objects and kept retrieval under one second.",
    metricIds: ["policy-objects-indexed", "policy-retrieval-speed"],
    linkLabel: "See Search & Explore",
    href: "#project-ndo-search-explore",
    icon: Search,
  },
  {
    id: "configuration-automation",
    title: "Multi-server configuration automation",
    summary:
      "I automated repeatable server setup during my Staff Engineer internship, saving more than 300 hours of manual work.",
    metricIds: ["manual-hours-saved"],
    linkLabel: "See the career milestone",
    href: "#career-cisco-staff-engineer-intern",
    icon: Clock3,
  },
  {
    id: "codeshift-cicd-platform",
    title: "Self-service delivery platform",
    summary:
      "I built APIs for VM and resource allocation, reducing manual deployment effort by 70%.",
    metricIds: ["manual-effort-reduced"],
    linkLabel: "See the delivery platform",
    href: "#project-codeshift-cicd-platform",
    icon: Workflow,
  },
];

function metricById(metricId: ImpactMetricId) {
  const metric = impactMetrics.find(({ id }) => id === metricId);
  if (!metric) throw new Error(`Missing impact metric: ${metricId}`);
  return metric;
}

function iconForFlow(flow: ProjectFlow): LucideIcon {
  switch (flow.id) {
    case "defect-resolution":
      return Bug;
    case "feature-planning":
      return Route;
    case "living-documentation":
      return BookOpen;
    case "simulation-validation":
      return FlaskConical;
    default:
      return BrainCircuit;
  }
}

function Metrics({
  metricIds,
}: {
  readonly metricIds: readonly ImpactMetricId[];
}) {
  return (
    <div className={styles.metrics}>
      {metricIds.map((metricId) => {
        const metric = metricById(metricId);
        return (
          <span className={styles.metric} key={metric.id}>
            <strong className={styles.value}>{metric.value}</strong>
            <span className={styles.label}>{metric.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function ImpactSummary() {
  return (
    <section aria-labelledby="impact-heading" className={styles.section}>
      <div className={styles.introduction}>
        <div>
          <p className={styles.eyebrow}>What I’ve delivered</p>
          <h2 className={styles.heading} id="impact-heading">
            Impact
          </h2>
        </div>
        <p className={styles.explanation}>
          A few results from systems, tools, and workflows I’ve built or helped
          deliver.
        </p>
      </div>

      <article
        aria-labelledby="agentic-impact-title"
        className={styles.spotlight}
        data-impact-outcome-id="agentic-engineering-automation"
        data-impact-spotlight=""
      >
        <div className={styles.spotlightOverview}>
          <p className={styles.currentLabel}>What I’m focused on now</p>
          <div className={styles.spotlightTitleRow}>
            <div aria-hidden="true" className={styles.spotlightIcon}>
              <BrainCircuit size={26} strokeWidth={1.8} />
            </div>
            <h3 className={styles.spotlightTitle} id="agentic-impact-title">
              {agenticProject.title}
            </h3>
          </div>

          <Metrics metricIds={["agentic-resolution-throughput"]} />

          <ul
            aria-label={`${agenticProject.title} capabilities`}
            className={styles.capabilities}
          >
            {agenticProject.capabilities.slice(0, 4).map((capability) => (
              <li className={styles.capability} key={capability}>
                {capability}
              </li>
            ))}
          </ul>

          <p className={styles.summary}>
            I design and apply AI agents, reusable Skills, and MCP integrations
            to investigate bugs, plan features, keep technical knowledge useful,
            and validate behavior before delivery.
          </p>
          <a
            className={styles.sourceLink}
            href="#project-agentic-engineering-automation"
          >
            See how I use AI in engineering
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </a>
        </div>

        <ul
          aria-label="Agentic engineering workflows"
          className={styles.flows}
        >
          {agenticProject.flows.map((flow) => {
            const FlowIcon = iconForFlow(flow);

            return (
              <li
                className={styles.flow}
                data-agentic-flow-id={flow.id}
                key={flow.id}
              >
                <div className={styles.flowHeader}>
                  <div aria-hidden="true" className={styles.flowIcon}>
                    <FlowIcon size={19} strokeWidth={1.8} />
                  </div>
                  <h4 className={styles.flowTitle}>{flow.title}</h4>
                </div>
                <p className={styles.flowSummary}>{flow.summary}</p>
                <p className={styles.flowPath}>{flow.path}</p>
              </li>
            );
          })}
        </ul>
      </article>

      <section
        aria-labelledby="established-impact-heading"
        className={styles.established}
      >
        <div className={styles.establishedHeader}>
          <div>
            <p className={styles.establishedEyebrow}>Earlier work</p>
            <h3
              className={styles.establishedTitle}
              id="established-impact-heading"
            >
              Earlier projects and results
            </h3>
          </div>
          <p className={styles.establishedExplanation}>
            A few results from systems and automation I built earlier in my
            career.
          </p>
        </div>

        <ul className={styles.establishedOutcomes}>
          {establishedOutcomes.map((outcome) => {
            const Icon = outcome.icon;

            return (
              <li
                className={styles.outcome}
                data-established-outcome-id={outcome.id}
                key={outcome.id}
              >
                <div aria-hidden="true" className={styles.outcomeIcon}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <h4 className={styles.outcomeTitle}>{outcome.title}</h4>
                <Metrics metricIds={outcome.metricIds} />
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
    </section>
  );
}
