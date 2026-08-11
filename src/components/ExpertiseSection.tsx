import { BrainCircuit, ServerCog, Workflow, Wrench } from "lucide-react";

import { expertiseAreas } from "../content/expertise";
import styles from "./ExpertiseSection.module.css";

const expertiseIcons = {
  "backend-systems": ServerCog,
  "generative-ai": BrainCircuit,
  "devops-automation": Workflow,
  "engineering-tools": Wrench,
} as const;

function firstSentence(description: string): string {
  const normalizedDescription = description.trimStart();
  const sentenceEnd = normalizedDescription.search(/[.!?](?=\s|$)/u);

  return sentenceEnd < 0
    ? normalizedDescription
    : normalizedDescription.slice(0, sentenceEnd + 1);
}

function remainingDescription(description: string, lead: string): string {
  return description.trimStart().slice(lead.length).trimStart();
}

export default function ExpertiseSection() {
  return (
    <section
      aria-labelledby="expertise-heading"
      className={styles.section}
      id="expertise"
    >
      <h2 className={styles.heading} id="expertise-heading">
        Expertise
      </h2>

      <div className={styles.grid}>
        {expertiseAreas.map((area) => {
          const Icon = expertiseIcons[area.id];
          const lead = firstSentence(area.description);
          const details = remainingDescription(area.description, lead);

          return (
            <article
              aria-labelledby={`${area.id}-heading`}
              className={styles.card}
              data-expertise-id={area.id}
              key={area.id}
            >
              <div className={styles.cardHeader}>
                <Icon
                  aria-hidden="true"
                  className={styles.icon}
                  focusable="false"
                  strokeWidth={1.75}
                />
                <h3
                  className={styles.cardHeading}
                  id={`${area.id}-heading`}
                >
                  {area.title}
                </h3>
              </div>
              <p className={styles.lead}>{lead}</p>
              <p
                className={styles.itemsLabel}
                id={`${area.id}-items-label`}
              >
                {area.itemsLabel}
              </p>
              <ul
                aria-labelledby={`${area.id}-items-label`}
                className={styles.items}
              >
                {area.items.map((item) => (
                  <li className={styles.item} key={item.label}>
                    {"url" in item ? (
                      <a
                        aria-label={item.label}
                        className={styles.externalLink}
                        href={item.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={styles.chip}>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
              <details className={styles.details}>
                <summary
                  aria-label={`Read full description for ${area.title}`}
                  className={styles.detailsSummary}
                >
                  Read full description
                </summary>
                <p className={styles.description}>{details}</p>
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
