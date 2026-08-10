import { careerEntries } from "../content/career";
import styles from "./CareerTimeline.module.css";

export default function CareerTimeline() {
  return (
    <section
      aria-labelledby="career-heading"
      className={styles.section}
      id="experience"
    >
      <h2 className={styles.heading} id="career-heading">
        Career
      </h2>

      <ol className={styles.timeline}>
        {careerEntries.map((entry) => {
          const technologiesHeadingId = `${entry.id}-technologies`;
          const highlightsHeadingId = `${entry.id}-highlights`;

          return (
            <li
              className={styles.timelineEntry}
              data-career-id={entry.id}
              key={entry.id}
            >
              <article className={styles.card}>
                <div className={styles.entryHeader}>
                  <div>
                    <h3 className={styles.role}>{entry.role}</h3>
                    <p className={styles.organization}>
                      <span>{entry.organization}</span>
                      <span>, </span>
                      <span>{entry.location}</span>
                    </p>
                  </div>
                  <p className={styles.period}>{entry.period}</p>
                </div>

                {"summary" in entry ? (
                  <p className={styles.summary}>{entry.summary}</p>
                ) : null}

                {entry.technologies.length > 0 ? (
                  <div className={styles.detailGroup}>
                    <h4
                      className={styles.detailHeading}
                      id={technologiesHeadingId}
                    >
                      Technologies
                    </h4>
                    <ul
                      aria-labelledby={technologiesHeadingId}
                      className={styles.technologies}
                    >
                      {entry.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {entry.highlights.length > 0 ? (
                  <div className={styles.detailGroup}>
                    <h4 className={styles.detailHeading} id={highlightsHeadingId}>
                      Highlights
                    </h4>
                    <ul
                      aria-labelledby={highlightsHeadingId}
                      className={styles.highlights}
                    >
                      {entry.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
