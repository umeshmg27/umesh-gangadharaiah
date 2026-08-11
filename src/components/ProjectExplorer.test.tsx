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
    expect(projectIds(explorer)).toEqual([
      "nd-nexusone",
      "ndo-search-explore",
      "nexus-dashboard-unified-backup-restore",
      "ndo-l4l7-service-chaining",
    ]);
    expect(
      within(explorer).getByRole("button", {
        name: "View all 13 projects",
      }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(explorer).queryByRole("searchbox", { name: "Search projects" }),
    ).not.toBeInTheDocument();
    expectOrdinaryCount(explorer, "Showing 4 featured projects.");
  });

  it("reveals all thirteen projects in source order with a described search input", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 13 projects",
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
    expectOrdinaryCount(explorer, "Showing 13 projects.");
  });

  it("presents the NexusOne release work as a public-safe first-person case study", async () => {
    const { explorer, user } = renderExplorer();
    const card = projectCard(explorer, "ND — NexusOne");
    const detailsButton = within(card).getByRole("button", {
      name: "Read more about ND — NexusOne",
    });

    expect(card).toHaveAttribute("data-project-id", "nd-nexusone");
    expect(card).toHaveTextContent("Details simplified for public sharing");
    expect(
      within(card).getByRole("img", {
        name: "Rows of servers in a modern data center",
      }),
    ).toBeInTheDocument();
    expect(
      within(
        within(card).getByRole("list", {
          name: "ND — NexusOne capabilities",
        }),
      ).getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual([
      "Backend code ownership",
      "Agent-assisted planning",
      "Living documentation",
      "Release validation",
    ]);

    await user.click(detailsButton);

    expect(card).toHaveTextContent(
      "I helped design and deliver a key data-center networking capability for NexusOne, serving as a backend code owner.",
    );
    expect(card).toHaveTextContent(
      "I used agent-assisted planning, documentation, and validation to help move the work from early design through release",
    );
    expect(card).toHaveTextContent(
      "I’ve generalized the details here and left out internal architecture, interfaces, repositories, release information, and operational data.",
    );
    expect(within(card).queryAllByRole("link")).toHaveLength(0);
  });

  it("redirects the former public project fragment to the NexusOne case study", async () => {
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    window.history.replaceState(null, "", "#project-nd-alphax");

    try {
      const { explorer } = renderExplorer();
      const heading = within(explorer).getByRole("heading", {
        level: 3,
        name: "ND — NexusOne",
      });

      await waitFor(() =>
        expect(window.location.hash).toBe("#project-nd-nexusone"),
      );
      expect(heading).toHaveFocus();
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
      expect(projectIds(explorer)).toEqual(featuredIds);
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
      expect(
        within(explorer).getByRole("heading", {
          level: 3,
          name: "Codeshift - CI/CD Platform",
        }),
      ).toHaveFocus();

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
        name: "View all 13 projects",
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
        name: "View all 13 projects",
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
    expect(collapseControl).toHaveAccessibleName("View all 13 projects");
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
        name: "View all 13 projects",
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
          `Open ${project.title} project`,
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
        name: "View all 13 projects",
      }),
    );

    const accessibleNames = projectRecords.map((project) => {
      const card = projectCard(explorer, project.title);
      const detailsButton = within(card).getByRole("button", {
        name: `Read more about ${project.title}`,
      });

      expect(detailsButton).toHaveTextContent(/^Read more$/);
      return detailsButton.getAttribute("aria-label");
    });

    expect(new Set(accessibleNames).size).toBe(projectRecords.length);

    const firstProject = projectRecords[0];
    const firstButton = within(
      projectCard(explorer, firstProject.title),
    ).getByRole("button", {
      name: `Read more about ${firstProject.title}`,
    });

    await user.click(firstButton);

    expect(firstButton).toHaveAccessibleName(
      `Show less about ${firstProject.title}`,
    );
    expect(firstButton).toHaveTextContent(/^Show less$/);
  });

  it("uses responsive lazy images and deterministic 180-character previews on every card", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 13 projects",
      }),
    );

    for (const project of projectRecords) {
      const card = projectCard(explorer, project.title);
      const detailsButton = within(card).getByRole("button", {
        name: `Read more about ${project.title}`,
      });
      const detailsId = detailsButton.getAttribute("aria-controls");
      const details = document.getElementById(detailsId ?? "");
      const preview = card.querySelector("[data-project-preview]");
      const visual = within(card).getByRole("img", {
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
      if (project.image.kind === "abstract") {
        expect(visual.tagName).toBe("DIV");
        expect(visual.closest("picture")).toBeNull();
        expect(visual).not.toHaveAttribute("loading");
        expect(visual).not.toHaveAttribute("decoding");
      } else {
        expect(visual).toHaveAttribute("loading", "lazy");
        expect(visual).toHaveAttribute("decoding", "async");
        expect(visual).toHaveAttribute("width", String(project.image.width));
        expect(visual).toHaveAttribute("height", String(project.image.height));

        if (project.image.kind === "local") {
          expect(visual.closest("picture")).not.toBeNull();
        } else {
          expect(visual.closest("picture")).toBeNull();
        }
      }
    }
  });

  it("presents the abstracted agentic case study without internal names, imagery, or links", async () => {
    const { explorer, user } = renderExplorer();

    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 13 projects",
      }),
    );

    const card = projectCard(explorer, "AI-Assisted Engineering Workflows");
    const visual = within(card).getByRole("img", {
      name: "Abstract workflow connecting AI agents, reusable Skills, and context integration",
    });
    const capabilityList = within(card).getByRole("list", {
      name: "AI-Assisted Engineering Workflows capabilities",
    });
    const detailsButton = within(card).getByRole("button", {
      name: "Read more about AI-Assisted Engineering Workflows",
    });

    expect(card).toHaveAttribute(
      "data-project-id",
      "agentic-engineering-automation",
    );
    expect(card).toHaveTextContent("Details simplified for public sharing");
    expect(visual.tagName).toBe("DIV");
    expect(visual.querySelector("img, picture")).toBeNull();
    expect(
      within(capabilityList).getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual([
      "AI Agents",
      "Reusable Skills",
      "Model Context Protocol",
      "Multi-agent orchestration",
      "Evidence-led RCA",
      "Human approval gates",
      "Automated validation",
    ]);
    expect(card).toHaveTextContent(
      "the reported throughput improvement is up to 5–6× for individual engineers and the wider team",
    );
    expect(card).toHaveTextContent(
      "I’ve left out identifying names and implementation details so I can share the approach publicly.",
    );
    expect(
      within(card).queryByRole("region", {
        name: "Four workflows I’ve put into practice",
      }),
    ).not.toBeInTheDocument();

    await user.click(detailsButton);

    const workflows = within(card).getByRole("region", {
      name: "Four workflows I’ve put into practice",
    });
    const flowCards = within(workflows).getAllByRole("listitem");

    expect(flowCards.map((flow) => flow.dataset.projectFlowId)).toEqual([
      "defect-resolution",
      "feature-planning",
      "living-documentation",
      "simulation-validation",
    ]);
    expect(
      flowCards.map((flow) =>
        within(flow).getByRole("heading", { level: 5 }).textContent,
      ),
    ).toEqual([
      "Finding and fixing bugs",
      "Planning features before coding",
      "Documenting complex systems",
      "Simulating and validating behavior",
    ]);
    expect(flowCards[0]).toHaveTextContent(
      "Issue context → Evidence → Root cause → Validation",
    );
    expect(flowCards[0]).toHaveTextContent(
      "I use agents to organize sanitized evidence, test competing explanations, and turn the strongest one into a human-reviewed root cause and validated fix plan.",
    );
    expect(flowCards[1]).toHaveTextContent(
      "Feature request → Existing behavior → Delivery plan → Tests",
    );
    expect(flowCards[2]).toHaveTextContent(
      "Verified behavior → System map → Practical guide",
    );
    expect(flowCards[3]).toHaveTextContent(
      "Synthetic scenario → Simulation → Validation evidence",
    );
    expect(workflows.textContent).not.toMatch(
      /(?:https?:\/\/|\b\d{1,3}(?:\.\d{1,3}){3}\b|\b[A-Z]+-\d{3,}\b)/u,
    );

    await user.click(detailsButton);

    expect(
      within(card).queryByRole("region", {
        name: "Four workflows I’ve put into practice",
      }),
    ).not.toBeInTheDocument();
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
    expect(card.textContent).not.toMatch(
      /(?:https?:\/\/|\b\d{1,3}(?:\.\d{1,3}){3}\b|\b[A-Z]+-\d{3,}\b)/u,
    );
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
      name: `Read more about ${firstProject.title}`,
    });
    const secondButton = within(secondCard).getByRole("button", {
      name: `Read more about ${secondProject.title}`,
    });
    const detailsId = firstButton.getAttribute("aria-controls");
    const details = document.getElementById(detailsId ?? "");

    expect(details).toHaveAttribute("hidden");
    await user.click(firstButton);

    expect(firstButton).toHaveAccessibleName(
      `Show less about ${firstProject.title}`,
    );
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(details).not.toHaveAttribute("hidden");
    expect(details).toBeVisible();
    expect(details?.textContent).toBe(firstProject.description);
    expect(secondButton).toHaveAttribute("aria-expanded", "false");

    await user.click(firstButton);

    expect(firstButton).toHaveAccessibleName(
      `Read more about ${firstProject.title}`,
    );
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(details).toHaveAttribute("hidden");
  });

  it("replaces the preview with one full source copy while expanded and restores it on collapse", async () => {
    const { explorer, user } = renderExplorer();
    await user.click(
      within(explorer).getByRole("button", {
        name: "View all 13 projects",
      }),
    );
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
      name: `Read more about ${project.title}`,
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
