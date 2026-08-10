import SocialLinks from "./SocialLinks";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <SocialLinks className={styles.socialLinks} />
        <p>A portfolio designed &amp; built by Umesh Gangadharaiah with 💜</p>
      </div>
    </footer>
  );
}
