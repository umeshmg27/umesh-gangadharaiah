import { profile } from "../content/profile";
import ResponsivePortfolioImage from "./ResponsivePortfolioImage";
import SocialLinks from "./SocialLinks";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.role}>{profile.role}</p>
        <h1 className={styles.heading} id="hero-heading">
          {profile.name}
        </h1>
        <p className={styles.specialization}>{profile.specialization}</p>

        <div className={styles.actions}>
          {profile.heroActions.map((action, index) => (
            <a
              className={index === 0 ? styles.primaryAction : styles.secondaryAction}
              href={action.href}
              key={action.href}
            >
              {action.label}
            </a>
          ))}
        </div>

        <SocialLinks className={styles.socialLinks} />
      </div>

      <div className={styles.portraitFrame}>
        <ResponsivePortfolioImage
          className={styles.portrait}
          image={profile.portrait}
          loading="eager"
          sizes="(max-width: 46rem) 78vw, 28rem"
        />
      </div>
    </section>
  );
}
