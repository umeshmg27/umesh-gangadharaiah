import { expertiseAreas } from "../content/expertise";
import styles from "./ExpertiseSection.module.css";

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
        {expertiseAreas.map((area) => (
          <article
            className={styles.card}
            data-expertise-id={area.id}
            key={area.id}
          >
            <h3 className={styles.cardHeading}>{area.title}</h3>
            <p className={styles.description}>{area.description}</p>
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
        ))}
      </div>
    </section>
  );
}
