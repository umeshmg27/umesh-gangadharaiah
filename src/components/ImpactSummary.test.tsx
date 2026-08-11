import { render, screen, within } from "@testing-library/react";

import ImpactSummary from "./ImpactSummary";

const expectedFlows = [
  {
    title: "Evidence-led defect resolution",
    path:
      "Sanitized issue → Evidence and hypotheses → Reviewed RCA and validation",
  },
  {
    title: "Agent-assisted feature planning",
    path:
      "Feature brief → System model and options → Implementation plan and tests",
  },
  {
    title: "Living system documentation",
    path:
      "Verified behavior → Connected system model → Living engineering guide",
  },
  {
    title: "Interactive simulation & validation",
    path:
      "Synthetic scenario → Deterministic model → Reviewable validation evidence",
  },
] as const;

test("makes four public-safe agentic workflows the primary Impact story", () => {
  render(<ImpactSummary />);

  const impact = screen.getByRole("region", { name: "Impact" });
  const spotlight = within(impact).getByRole("article", {
    name: "Agentic Engineering Automation",
  });
  const workflows = within(spotlight).getByRole("list", {
    name: "Agentic engineering workflows",
  });
  const flowCards = within(workflows).getAllByRole("listitem");

  expect(spotlight).toHaveAttribute("data-impact-spotlight");
  expect(spotlight).toHaveTextContent("Current focus");
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
      name: "Explore agentic engineering project",
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
    name: "Agentic Engineering Automation",
  });
  const established = within(impact).getByRole("region", {
    name: "Established product outcomes",
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
