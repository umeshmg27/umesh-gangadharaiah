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

test("renders the current senior role and its agentic engineering outcomes", () => {
  render(<CareerTimeline />);

  const currentEntry = document.getElementById(
    "career-cisco-senior-software-engineer",
  );
  expect(currentEntry).not.toBeNull();
  const entry = within(currentEntry as HTMLElement);

  expect(
    entry.getByRole("heading", { level: 3, name: "Senior Software Engineer" }),
  ).toBeInTheDocument();
  expect(entry.getByText("Oct 2025 – Present")).toBeInTheDocument();
  expect(
    entry.getByText(
      "Build multiple AI agents, reusable Skills, and Model Context Protocol (MCP) integrations to automate day-to-day engineering tasks",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "Drive feature development through agent-assisted workflows spanning implementation, validation, and delivery",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "Use AI agents to investigate and resolve software defects, increasing bug-resolution throughput by up to 5–6× per engineer and across the wider team",
    ),
  ).toBeInTheDocument();
});
