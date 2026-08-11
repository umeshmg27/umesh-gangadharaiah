import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expertiseAreas } from "../content/expertise";
import ExpertiseSection from "./ExpertiseSection";

const leadSentences = {
  "backend-systems":
    "Experienced backend engineer with hands-on expertise in designing and managing microservices within large-scale distributed systems.",
  "generative-ai":
    "I'm a big fan of Generative AI and Large Language Models (LLMs), and I've had the chance to dive deep into these technologies through research and experimentation.",
  "devops-automation":
    "Beyond backend development, I bring a strong skill set in DevOps and internal automation.",
  "engineering-tools":
    "My approach with tools, services and platforms is hands-on, curiosity-driven, allowing me to be agile and adapt to the latest technology across development, automation and debugging workflows.",
} as const;

const iconClasses = {
  "backend-systems": "lucide-server-cog",
  "generative-ai": "lucide-brain-circuit",
  "devops-automation": "lucide-workflow",
  "engineering-tools": "lucide-wrench",
} as const;

describe("ExpertiseSection", () => {
  it("keeps every source-ordered area concise without hiding its source content", async () => {
    const user = userEvent.setup();
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
      const disclosure = card.querySelector("details");
      const summary = disclosure?.querySelector("summary");
      const fullDescription = disclosure?.querySelector("p");

      expect(card).toHaveAttribute("aria-labelledby", `${area.id}-heading`);
      expect(heading).toHaveAttribute("id", `${area.id}-heading`);
      expect(icon).toHaveClass(iconClasses[area.id]);
      expect(icon).toHaveAttribute("focusable", "false");
      expect(
        within(card).getByText(leadSentences[area.id], { selector: "p" }),
      ).toBeVisible();
      expect(
        within(items).getAllByRole("listitem").map((item) => item.textContent),
      ).toEqual(area.items.map(({ label }) => label));
      expect(disclosure).not.toHaveAttribute("open");
      expect(summary).toHaveAccessibleName(
        `Read full description for ${area.title}`,
      );
      expect(
        `${leadSentences[area.id]} ${fullDescription?.textContent ?? ""}`,
      ).toBe(area.description.trimStart());
    }

    const firstDisclosure = cards[0].querySelector("details");
    const firstSummary = firstDisclosure?.querySelector("summary");

    if (!firstSummary) throw new Error("Missing first expertise summary");
    await user.click(firstSummary);
    expect(firstDisclosure).toHaveAttribute("open");
  });

  it("preserves the verified publication links as visible safe destinations", () => {
    render(<ExpertiseSection />);
    const expertise = screen.getByRole("region", { name: "Expertise" });

    for (const [name, href] of [
      [
        "SMALL LLMS FOR EDGE COMPUTING",
        "https://www.tdcommons.org/dpubs_series/7086/",
      ],
      [
        "MULTI-STAGE FINE-TUNING PROCESS",
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
