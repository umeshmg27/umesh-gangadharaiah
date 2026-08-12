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
      "My role has grown from delivering backend features to improving how engineers across the team approach feature delivery and defect resolution",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "I build reusable agents, Skills, and MCP integrations around recurring day-to-day engineering work, then refine them through hands-on use",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "I help engineers adopt these workflows while keeping technical judgment, code review, and release decisions firmly human-owned",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "Engineers using these workflows have reported up to 5–6× higher defect-resolution throughput, both individually and across their teams",
    ),
  ).toBeInTheDocument();
});

test("renders the abstracted NexusOne work under Software Engineer III", () => {
  render(<CareerTimeline />);

  const entryElement = document.getElementById(
    "career-cisco-software-engineer-iii",
  );
  expect(entryElement).not.toBeNull();
  const entry = within(entryElement as HTMLElement);

  expect(entry.getByText("Aug 2024 – Sep 2025")).toBeInTheDocument();
  expect(
    entry.getByText(
      "Backend feature ownership for NexusOne across distributed systems integration, automated validation, and release readiness",
    ),
  ).toBeInTheDocument();
  expect(entry.getByText("Distributed Systems")).toBeInTheDocument();
  expect(
    entry.getByText(
      "I helped deliver a major NexusOne networking capability with a broader engineering team and owned substantial backend work through implementation and release integration",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "I strengthened reliability across lifecycle and topology scenarios through recovery-focused engineering, integration fixes, and hands-on validation",
    ),
  ).toBeInTheDocument();
  expect(
    entry.getByText(
      "I built broad automated test coverage and engineering documentation to support release readiness and continued hardening",
    ),
  ).toBeInTheDocument();
});
