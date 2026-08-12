import { render, screen, within } from "@testing-library/react";

import { expertiseAreas } from "../content/expertise";
import ExpertiseSection from "./ExpertiseSection";

const iconClasses = {
  "backend-systems": "lucide-server-cog",
  "generative-ai": "lucide-brain-circuit",
  "devops-automation": "lucide-workflow",
  "engineering-tools": "lucide-wrench",
} as const;

describe("ExpertiseSection", () => {
  it("shows every complete source-ordered expertise description without a disclosure", () => {
    render(<ExpertiseSection />);

    const expertise = screen.getByRole("region", { name: "Expertise" });
    const cards = within(expertise).getAllByRole("article");

    expect(cards.map((card) => card.dataset.expertiseId)).toEqual(
      expertiseAreas.map(({ id }) => id),
    );

    for (const [index, area] of expertiseAreas.entries()) {
      const card = cards[index];
      const heading = within(card).getByRole("heading", {
        level: 3,
        name: area.title,
      });
      const icon = card.querySelector("svg[aria-hidden='true']");
      const items = within(card).getByRole("list", { name: area.itemsLabel });
      const description = card.querySelector("[data-expertise-description]");

      expect(card).toHaveAttribute("aria-labelledby", `${area.id}-heading`);
      expect(heading).toHaveAttribute("id", `${area.id}-heading`);
      expect(icon).toHaveClass(iconClasses[area.id]);
      expect(icon).toHaveAttribute("focusable", "false");
      expect(description).toBeVisible();
      expect(description).toHaveTextContent(area.description);
      expect(
        within(items).getAllByRole("listitem").map((item) => item.textContent),
      ).toEqual(area.items.map(({ label }) => label));
      expect(card.querySelector("details, summary")).toBeNull();
      expect(within(card).getAllByText(area.description, { selector: "p" })).toHaveLength(
        1,
      );
    }
  });

  it("preserves the verified publication links as visible safe destinations", () => {
    render(<ExpertiseSection />);
    const expertise = screen.getByRole("region", { name: "Expertise" });

    for (const [name, href] of [
      [
        "Small LLMs for Edge Computing",
        "https://www.tdcommons.org/dpubs_series/7086/",
      ],
      [
        "Multi-Stage Fine-Tuning Process",
        "https://www.tdcommons.org/dpubs_series/7085/",
      ],
    ] as const) {
      const publication = within(expertise).getByRole("link", { name });

      expect(publication).toBeVisible();
      expect(publication).toHaveAttribute("href", href);
      expect(publication).toHaveAttribute("target", "_blank");
      expect(publication).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
