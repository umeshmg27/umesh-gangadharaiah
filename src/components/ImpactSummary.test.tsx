import { render, screen, within } from "@testing-library/react";

import ImpactSummary from "./ImpactSummary";

const expectedFlows = [
  {
    title: "Finding and fixing bugs",
    path: "Issue context → Evidence → Root cause → Validation",
  },
  {
    title: "Planning features before coding",
    path: "Feature request → Existing behavior → Delivery plan → Tests",
  },
  {
    title: "Documenting complex systems",
    path: "Verified behavior → System map → Practical guide",
  },
  {
    title: "Simulating and validating behavior",
    path: "Synthetic scenario → Simulation → Validation evidence",
  },
] as const;

test("makes four public-safe agentic workflows the primary Impact story", () => {
  render(<ImpactSummary />);

  const impact = screen.getByRole("region", { name: "Impact" });
  const spotlight = within(impact).getByRole("article", {
    name: "AI-Assisted Engineering Workflows",
  });
  const workflows = within(spotlight).getByRole("list", {
    name: "Agentic engineering workflows",
  });
  const flowCards = within(workflows).getAllByRole("listitem");

  expect(spotlight).toHaveAttribute("data-impact-spotlight");
  expect(impact).toHaveTextContent("What I’ve delivered");
  expect(spotlight).toHaveTextContent("What I’m focused on now");
  expect(spotlight).toHaveTextContent("Up to 5–6×");
  expect(spotlight).toHaveTextContent("reported defect-resolution throughput");
  expect(flowCards).toHaveLength(expectedFlows.length);
  expect(flowCards.map((card) => card.dataset.agenticFlowId)).toEqual([
    "defect-resolution",
    "feature-planning",
    "living-documentation",
    "simulation-validation",
  ]);
  expect(
    flowCards.map((card) =>
      within(card).getByRole("heading", { level: 4 }).textContent,
    ),
  ).toEqual(expectedFlows.map(({ title }) => title));

  for (const [index, expectedFlow] of expectedFlows.entries()) {
    expect(flowCards[index]).toHaveTextContent(expectedFlow.path);
  }

  expect(
    within(spotlight).getByRole("link", {
      name: "See how I use AI in engineering",
    }),
  ).toHaveAttribute("href", "#project-agentic-engineering-automation");
  expect(spotlight.textContent).not.toMatch(
    /(?:https?:\/\/|\b\d{1,3}(?:\.\d{1,3}){3}\b|\b[A-Z]+-\d{3,}\b)/u,
  );
  expect(spotlight.querySelectorAll("a")).toHaveLength(1);
  expect(spotlight.querySelector("img, picture")).toBeNull();
});

test("keeps established outcomes as a separate secondary group", () => {
  render(<ImpactSummary />);

  const impact = screen.getByRole("region", { name: "Impact" });
  const spotlight = within(impact).getByRole("article", {
    name: "AI-Assisted Engineering Workflows",
  });
  const established = within(impact).getByRole("region", {
    name: "Earlier projects and results",
  });
  const establishedOutcomes = Array.from(
    established.querySelectorAll<HTMLElement>("[data-established-outcome-id]"),
  );

  expect(
    establishedOutcomes.map(
      (outcome) => outcome.dataset.establishedOutcomeId,
    ),
  ).toEqual([
    "ndo-search-explore",
    "configuration-automation",
    "codeshift-cicd-platform",
  ]);
  expect(spotlight.compareDocumentPosition(established)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
});
