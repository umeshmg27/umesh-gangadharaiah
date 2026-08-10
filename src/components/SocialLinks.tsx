import { profile } from "../content/profile";

type SocialLinksProps = {
  readonly className?: string;
};

export default function SocialLinks({ className }: SocialLinksProps) {
  const links = [
    { label: "GitHub", href: profile.githubUrl },
    { label: "LinkedIn", href: profile.linkedinUrl },
  ] as const;

  return (
    <ul aria-label="Social links" className={className}>
      {links.map((link) => (
        <li key={link.label}>
          <a
            aria-label={link.label}
            href={link.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
