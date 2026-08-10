import { impactMetrics } from "../content/impact";
import styles from "./ImpactSummary.module.css";

export default function ImpactSummary() {
  return (
    <section
      aria-labelledby="impact-heading"
      className={styles.section}
    >
      <p className={styles.eyebrow}>Selected outcomes</p>
      <h2 className={styles.heading} id="impact-heading">
        Impact
      </h2>
      <ul className={styles.metrics}>
        {impactMetrics.map((metric) => (
          <li className={styles.metric} key={metric.id}>
            <strong className={styles.value}>{metric.value}</strong>
            <span className={styles.label}>{metric.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
