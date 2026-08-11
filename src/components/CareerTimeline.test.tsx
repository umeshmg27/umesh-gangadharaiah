import { render, screen, within } from "@testing-library/react";

import { careerEntries } from "../content/career";
import CareerTimeline from "./CareerTimeline";

test("renders an accessible reverse-chronological timeline without adding controls", () => {
  const { container } = render(<CareerTimeline />);

  const career = screen.getByRole("region", { name: "Career" });
  const timeline = within(career).getByRole("list", {
    name: "Career timeline, newest to oldest",
  });
  expect(timeline.tagName).toBe("OL");

  const entries = Array.from(timeline.children) as HTMLElement[];
  expect(entries).toHaveLength(careerEntries.length);
  expect(entries.every((entry) => entry.tagName === "LI")).toBe(true);
  expect(entries.map((entry) => entry.getAttribute("data-career-id"))).toEqual(
    careerEntries.map((entry) => entry.id),
  );
  expect(entries.map((entry) => entry.id)).toEqual(
    careerEntries.map((entry) => `career-${entry.id}`),
  );

  for (const [index, careerEntry] of careerEntries.entries()) {
    const entry = entries[index];
    expect(
      within(entry).getByRole("article", { name: careerEntry.role }),
    ).toBeInTheDocument();
    expect(within(entry).getByText(careerEntry.period)).toBeInTheDocument();
    expect(within(entry).getByText(careerEntry.organization)).toBeInTheDocument();
    expect(within(entry).getByText(careerEntry.location)).toBeInTheDocument();
  }

  const markers = timeline.querySelectorAll("[data-timeline-marker]");
  expect(markers).toHaveLength(careerEntries.length);
  for (const marker of markers) {
    expect(marker).toHaveAttribute("aria-hidden", "true");
  }

  expect(container.querySelector("a, button, [tabindex]")).toBeNull();
});
