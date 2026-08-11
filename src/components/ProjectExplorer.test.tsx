import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, vi } from "vitest";

import { createWordBoundaryPreview } from "../content/createWordBoundaryPreview";
import type { Project } from "../content/models";
import { projects } from "../content/projects";
import ProjectExplorer from "./ProjectExplorer";

const projectRecords: readonly Project[] = projects;
const featuredIds = projectRecords
  .filter((project) => project.featuredOrder !== undefined)
  .sort(
    (left, right) =>
      (left.featuredOrder ?? Number.POSITIVE_INFINITY) -
      (right.featuredOrder ?? Number.POSITIVE_INFINITY),
  )
  .map((project) => project.id);

afterEach(() => {
  window.history.replaceState(null, "", "#");
});

function renderExplorer() {
  const user = userEvent.setup();
  render(<ProjectExplorer />);

  return {
    explorer: screen.getByRole("region", { name: "Projects" }),
    user,
  };
}

function projectCards(explorer: HTMLElement): HTMLElement[] {
  return within(explorer).queryAllByRole("article");
}

function projectIds(explorer: HTMLElement): (string | undefined)[] {
  return projectCards(explorer).map((card) => card.dataset.projectId);
}

function projectCard(explorer: HTMLElement, title: string): HTMLElement {
  const card = within(explorer)
    .getByRole("heading", { level: 3, name: title })
    .closest("article");

  if (!card) throw new Error(`Missing project card for ${title}`);
  return card;
}

function expectOrdinaryCount(explorer: HTMLElement, text: string): void {
  const count = within(explorer).getByText(text);

  expect(count.tagName).toBe("P");
  expect(count).not.toHaveAttribute("aria-live");
  expect(count).not.toHaveAttribute("role");
  expect(within(explorer).queryByRole("status")).not.toBeInTheDocument();
}

describe("ProjectExplorer", () => {
  it("leads with the four approved featured projects in featured order", () => {
    const { explorer } = renderExplorer();

    expect(
      within(explorer).getByRole("heading", { level: 2, name: "Projects" }),
    ).toBeInTheDocument();
    expect(projectIds(explorer)).toEqual(featuredIds);
    expect(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(explorer).queryByRole("searchbox", { name: "Search projects" }),
    ).not.toBeInTheDocument();
    expectOrdinaryCount(explorer, "Showing 4 featured projects.");
  });

  it("reveals all twelve projects in source order with a described search input", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    );

    expect(projectIds(explorer)).toEqual(projectRecords.map(({ id }) => id));
    expect(
      within(explorer).getByRole("button", {
        name: "Show featured projects",
      }),
    ).toHaveAttribute("aria-expanded", "true");

    const search = within(explorer).getByRole("searchbox", {
      name: "Search projects",
    });
    const descriptionId = search.getAttribute("aria-describedby");

    expect(search).toHaveAttribute("type", "search");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? "")).toHaveTextContent(
      "Search project titles and descriptions.",
    );
    expectOrdinaryCount(explorer, "Showing 12 projects.");
  });

  it("reveals and scrolls to an archived project addressed by its fragment", async () => {
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    window.history.replaceState(
      null,
      "",
      "#project-codeshift-cicd-platform",
    );

    try {
      const { explorer, user } = renderExplorer();

      await waitFor(() =>
        expect(
          explorer.querySelector("#project-codeshift-cicd-platform"),
        ).toBeInTheDocument(),
      );
      expect(
        within(explorer).getByRole("button", {
          name: "Show featured projects",
        }),
      ).toHaveAttribute("aria-expanded", "true");
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });

      await user.click(
        within(explorer).getByRole("button", {
          name: "Show featured projects",
        }),
      );
      expect(window.location.hash).toBe("#projects");
      expect(
        explorer.querySelector("#project-codeshift-cicd-platform"),
      ).toBeNull();
    } finally {
      if (originalScrollIntoView) {
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
          configurable: true,
          value: originalScrollIntoView,
        });
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
      }
    }
  });

  it("filters title and description text without re-ranking source matches", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    );
    const search = within(explorer).getByRole("searchbox", {
      name: "Search projects",
    });

    await user.type(search, "tool");

    expect(projectIds(explorer)).toEqual([
      "resource-allocation-manager",
      "ucs-config-tool",
    ]);
    expectOrdinaryCount(explorer, "Showing 2 projects.");

    await user.clear(search);
    await user.type(search, "backup system");

    expect(projectIds(explorer)).toEqual(["telegram-data-storage"]);
    expectOrdinaryCount(explorer, "Showing 1 project.");

    await user.clear(search);
    await user.type(search, "no matching portfolio copy");

    expect(projectCards(explorer)).toHaveLength(0);
    expectOrdinaryCount(explorer, "Showing 0 projects.");
    expect(
      within(explorer).getByText("No projects match your search."),
    ).toBeInTheDocument();
  });

  it("focuses the collapse control before hiding archive content and clears search", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    );
    const search = within(explorer).getByRole("searchbox", {
      name: "Search projects",
    });
    await user.type(search, "tool");
    search.focus();
    expect(search).toHaveFocus();

    const collapseControl = within(explorer).getByRole("button", {
      name: "Show featured projects",
    });
    fireEvent.click(collapseControl);

    expect(collapseControl).toHaveFocus();
    expect(collapseControl).toHaveAccessibleName("View all 12 projects");
    expect(projectIds(explorer)).toEqual(featuredIds);
    expect(
      within(explorer).queryByRole("searchbox", { name: "Search projects" }),
    ).not.toBeInTheDocument();

    await user.click(collapseControl);

    expect(
      within(explorer).getByRole("searchbox", { name: "Search projects" }),
    ).toHaveValue("");
    expect(projectIds(explorer)).toEqual(projectRecords.map(({ id }) => id));
  });

  it("renders only the verified Telegram destination as a safe explicit link", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    );

    for (const project of projectRecords) {
      const card = projectCard(explorer, project.title);
      const links = within(card).queryAllByRole("link");
      const heading = within(card).getByRole("heading", {
        level: 3,
        name: project.title,
      });
      const image = within(card).getByRole("img", { name: project.image.alt });

      expect(card.closest("a")).toBeNull();
      expect(heading.closest("a")).toBeNull();
      expect(image.closest("a")).toBeNull();

      if (project.publicUrl) {
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveAccessibleName(
          `View ${project.title} project`,
        );
        expect(links[0]).toHaveAttribute("href", project.publicUrl);
        expect(links[0]).toHaveAttribute("target", "_blank");
        expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
      } else {
        expect(links).toHaveLength(0);
      }
    }

    expect(within(explorer).getAllByRole("link")).toHaveLength(1);
    expect(explorer.querySelector('a[href="#"]')).toBeNull();
  });

  it("gives every visible detail toggle a unique project-specific accessible name", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    );

    const accessibleNames = projectRecords.map((project) => {
      const card = projectCard(explorer, project.title);
      const detailsButton = within(card).getByRole("button", {
        name: `Read Project Details for ${project.title}`,
      });

      expect(detailsButton).toHaveTextContent(/^Read Project Details$/);
      return detailsButton.getAttribute("aria-label");
    });

    expect(new Set(accessibleNames).size).toBe(projectRecords.length);

    const firstProject = projectRecords[0];
    const firstButton = within(
      projectCard(explorer, firstProject.title),
    ).getByRole("button", {
      name: `Read Project Details for ${firstProject.title}`,
    });

    await user.click(firstButton);

    expect(firstButton).toHaveAccessibleName(
      `Hide Project Details for ${firstProject.title}`,
    );
    expect(firstButton).toHaveTextContent(/^Hide Project Details$/);
  });

  it("uses responsive lazy images and deterministic 180-character previews on every card", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 12 projects",
      }),
    );

    for (const project of projectRecords) {
      const card = projectCard(explorer, project.title);
      const detailsButton = within(card).getByRole("button", {
        name: `Read Project Details for ${project.title}`,
      });
      const detailsId = detailsButton.getAttribute("aria-controls");
      const details = document.getElementById(detailsId ?? "");
      const preview = Array.from(card.querySelectorAll("p")).find(
        (paragraph) => paragraph.id !== detailsId,
      );
      const image = within(card).getByRole("img", {
        name: project.image.alt,
      });

      expect(card).toHaveAttribute("data-project-id", project.id);
      expect(preview?.textContent).toBe(
        createWordBoundaryPreview(project.description, 180),
      );
      expect(detailsId).toBe(`${project.id}-details`);
      expect(detailsButton).toHaveAttribute("aria-expanded", "false");
      expect(details).toHaveTextContent(project.description);
      expect(details).not.toBeVisible();
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("decoding", "async");
      expect(image).toHaveAttribute("width", String(project.image.width));
      expect(image).toHaveAttribute("height", String(project.image.height));

      if (project.image.kind === "local") {
        expect(image.closest("picture")).not.toBeNull();
      } else {
        expect(image.closest("picture")).toBeNull();
      }
    }
  });

  it("reveals and hides unchanged full copy through independent controlled buttons", async () => {
    const { explorer, user } = renderExplorer();
    const firstProject = projectRecords.find(
      ({ id }) => id === "ndo-search-explore",
    );
    const secondProject = projectRecords.find(
      ({ id }) => id === "nexus-dashboard-unified-backup-restore",
    );

    expect(firstProject).toBeDefined();
    expect(secondProject).toBeDefined();
    if (!firstProject || !secondProject) return;

    const firstCard = projectCard(explorer, firstProject.title);
    const secondCard = projectCard(explorer, secondProject.title);
    const firstButton = within(firstCard).getByRole("button", {
      name: `Read Project Details for ${firstProject.title}`,
    });
    const secondButton = within(secondCard).getByRole("button", {
      name: `Read Project Details for ${secondProject.title}`,
    });
    const detailsId = firstButton.getAttribute("aria-controls");
    const details = document.getElementById(detailsId ?? "");

    expect(details).toHaveAttribute("hidden");
    await user.click(firstButton);

    expect(firstButton).toHaveAccessibleName(
      `Hide Project Details for ${firstProject.title}`,
    );
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(details).not.toHaveAttribute("hidden");
    expect(details).toBeVisible();
    expect(details?.textContent).toBe(firstProject.description);
    expect(secondButton).toHaveAttribute("aria-expanded", "false");

    await user.click(firstButton);

    expect(firstButton).toHaveAccessibleName(
      `Read Project Details for ${firstProject.title}`,
    );
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(details).toHaveAttribute("hidden");
  });

  it("replaces the preview with one full source copy while expanded and restores it on collapse", async () => {
    const { explorer, user } = renderExplorer();
    const project = projectRecords.find(
      ({ id }) => id === "resource-allocation-manager",
    );

    expect(project).toBeDefined();
    if (!project) return;
    expect(createWordBoundaryPreview(project.description, 180)).toBe(
      project.description,
    );

    const card = projectCard(explorer, project.title);
    const detailsButton = within(card).getByRole("button", {
      name: `Read Project Details for ${project.title}`,
    });
    const detailsId = detailsButton.getAttribute("aria-controls");
    const details = document.getElementById(detailsId ?? "");
    const preview = Array.from(card.querySelectorAll("p")).find(
      (paragraph) => paragraph.id !== detailsId,
    );

    expect(preview).toBeVisible();
    expect(details).not.toBeVisible();

    await user.click(detailsButton);

    expect(preview).not.toBeInTheDocument();
    expect(details).toBeVisible();
    expect(
      Array.from(card.querySelectorAll("p")).filter(
        (paragraph) => paragraph.textContent === project.description,
      ),
    ).toHaveLength(1);

    await user.click(detailsButton);

    const restoredPreview = Array.from(card.querySelectorAll("p")).find(
      (paragraph) => paragraph.id !== detailsId,
    );
    expect(restoredPreview).toBeVisible();
    expect(restoredPreview?.textContent).toBe(project.description);
    expect(details).not.toBeVisible();
  });
});
