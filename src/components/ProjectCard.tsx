import { Bot, Network, Puzzle } from "lucide-react";

import { createWordBoundaryPreview } from "../content/createWordBoundaryPreview";
import type { Project } from "../content/models";
import styles from "./ProjectCard.module.css";
import ResponsivePortfolioImage from "./ResponsivePortfolioImage";

type ProjectCardProps = {
  readonly project: Project;
  readonly expanded: boolean;
  readonly onToggle: (projectId: string) => void;
};

export default function ProjectCard({
  project,
  expanded,
  onToggle,
}: ProjectCardProps) {
  const detailsId = `${project.id}-details`;
  const detailsAction = expanded
    ? "Hide Project Details"
    : "Read Project Details";

  return (
    <article
      className={styles.card}
      data-project-id={project.id}
      id={`project-${project.id}`}
    >
      <div className={styles.imageFrame}>
        {project.image.kind === "abstract" ? (
          <div
            aria-label={project.image.alt}
            className={styles.abstractVisual}
            role="img"
          >
            <div className={styles.abstractNode}>
              <Bot aria-hidden="true" size={24} strokeWidth={1.8} />
              <span>{project.image.labels[0]}</span>
            </div>
            <span aria-hidden="true" className={styles.abstractConnector} />
            <div className={`${styles.abstractNode} ${styles.abstractNodePrimary}`}>
              <Puzzle aria-hidden="true" size={24} strokeWidth={1.8} />
              <span>{project.image.labels[1]}</span>
            </div>
            <span aria-hidden="true" className={styles.abstractConnector} />
            <div className={styles.abstractNode}>
              <Network aria-hidden="true" size={24} strokeWidth={1.8} />
              <span>{project.image.labels[2]}</span>
            </div>
          </div>
        ) : (
          <ResponsivePortfolioImage
            className={styles.image}
            image={project.image}
            loading="lazy"
            sizes="(max-width: 50rem) calc(100vw - 2rem), 36rem"
          />
        )}
      </div>

      <div className={styles.content}>
        {project.abstracted ? (
          <p className={styles.abstractedLabel}>Abstracted public case study</p>
        ) : null}
        <h3 className={styles.heading}>{project.title}</h3>
        {!expanded ? (
          <p className={styles.preview} data-project-preview="">
            {createWordBoundaryPreview(project.description, 180)}
          </p>
        ) : null}

        {project.capabilities ? (
          <ul
            aria-label={`${project.title} capabilities`}
            className={styles.capabilities}
          >
            {project.capabilities.map((capability) => (
              <li className={styles.capability} key={capability}>
                {capability}
              </li>
            ))}
          </ul>
        ) : null}

        <div className={styles.actions}>
          <button
            aria-controls={detailsId}
            aria-expanded={expanded}
            aria-label={`${detailsAction} for ${project.title}`}
            className={styles.detailsButton}
            onClick={() => onToggle(project.id)}
            type="button"
          >
            {detailsAction}
          </button>

          {project.publicUrl ? (
            <a
              aria-label={`View ${project.title} project`}
              className={styles.projectLink}
              href={project.publicUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              View Project <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>

        <p
          className={styles.details}
          hidden={!expanded}
          id={detailsId}
        >
          {project.description}
        </p>
      </div>
    </article>
  );
}
