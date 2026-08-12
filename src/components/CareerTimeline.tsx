import { useEffect } from "react";

import { careerEntries } from "../content/career";
import styles from "./CareerTimeline.module.css";

const legacySoftwareEngineerIHash = "#career-cisco-staff-engineer-intern";
const softwareEngineerIHash = "#career-cisco-software-engineer-i";

export default function CareerTimeline() {
  useEffect(() => {
    function canonicalizeFormerRoleHash(): void {
      if (window.location.hash !== legacySoftwareEngineerIHash) return;

      window.history.replaceState(null, "", softwareEngineerIHash);
      const target = document.getElementById(softwareEngineerIHash.slice(1));
      if (!target) return;

      target.scrollIntoView({ block: "start" });
      const heading = target.querySelector<HTMLElement>("h3");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }

    canonicalizeFormerRoleHash();
    window.addEventListener("hashchange", canonicalizeFormerRoleHash);

    return () =>
      window.removeEventListener("hashchange", canonicalizeFormerRoleHash);
  }, []);

  return (
    <section
      aria-labelledby="career-heading"
      className={styles.section}
      id="experience"
    >
      <h2 className={styles.heading} id="career-heading">
        Career
      </h2>

      <ol
        aria-label="Career timeline, newest to oldest"
        className={styles.timeline}
      >
        {careerEntries.map((entry) => {
          const roleHeadingId = `${entry.id}-role`;
          const technologiesHeadingId = `${entry.id}-technologies`;
          const highlightsHeadingId = `${entry.id}-highlights`;

          return (
            <li
              className={styles.timelineEntry}
              data-career-id={entry.id}
              id={`career-${entry.id}`}
              key={entry.id}
            >
              <p className={styles.period}>{entry.period}</p>
              <span
                aria-hidden="true"
                className={styles.marker}
                data-timeline-marker=""
              />

              <article aria-labelledby={roleHeadingId} className={styles.card}>
                <div className={styles.entryHeader}>
                  <h3 className={styles.role} id={roleHeadingId}>
                    {entry.role}
                  </h3>
                  <p className={styles.organization}>
                    <span>{entry.organization}</span>
                    <span>, </span>
                    <span>{entry.location}</span>
                  </p>
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
