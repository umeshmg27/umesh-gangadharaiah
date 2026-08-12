import { BrainCircuit, ServerCog, Workflow, Wrench } from "lucide-react";

import { expertiseAreas } from "../content/expertise";
import styles from "./ExpertiseSection.module.css";

const expertiseIcons = {
  "backend-systems": ServerCog,
  "generative-ai": BrainCircuit,
  "devops-automation": Workflow,
  "engineering-tools": Wrench,
} as const;

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
              <p
                className={styles.description}
                data-expertise-description
              >
                {area.description}
              </p>
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
