import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import App from "./App";
import ResponsivePortfolioImage from "./components/ResponsivePortfolioImage";
import type { LocalImageAsset, RemoteImageAsset } from "./content/models";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.theme = "dark";
  document.documentElement.style.colorScheme = "dark";
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: false })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function renderPortfolio() {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    }),
  );

  await act(async () => {
    render(<App />);
  });

  return fetchSpy;
}

test("renders the semantic shell with all five primary sections", async () => {
  const fetchSpy = await renderPortfolio();

  expect(screen.getByRole("banner")).toBeInTheDocument();
  const primaryNavigation = screen.getByRole("navigation", { hidden: true });
  expect(primaryNavigation).toHaveAttribute(
    "aria-label",
    "Primary navigation",
  );
  const mainLandmark = screen.getByRole("main");
  expect(mainLandmark).toHaveAttribute("id", "main-content");
  expect(mainLandmark).toHaveAttribute("tabindex", "-1");
  mainLandmark.focus();
  expect(mainLandmark).toHaveFocus();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  const pageHeadings = screen.getAllByRole("heading", { level: 1 });
  expect(pageHeadings).toHaveLength(1);
  expect(pageHeadings[0]).toHaveAccessibleName("Umesh Gangadharaiah");

  for (const heading of [
    "Expertise",
    "Career",
    "Projects",
    "Recognition",
    "Contact Me",
  ]) {
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  }

  const main = screen.getByRole("main");
  expect(
    Array.from(
      main.querySelectorAll(
        "#expertise, #experience, #projects, #recognition, #contact",
      ),
      (section) => section.id,
    ),
  ).toEqual(["expertise", "experience", "projects", "recognition", "contact"]);
  expect(fetchSpy).not.toHaveBeenCalled();
});

test("renders typed hero actions, safe named social links, and the fallback portrait", async () => {
  await renderPortfolio();
  const hero = screen.getByRole("region", { name: "Umesh Gangadharaiah" });

  expect(within(hero).getByText("Backend Engineer")).toBeInTheDocument();
  expect(
    within(hero).getByText("Distributed Systems & Infrastructure"),
  ).toBeInTheDocument();
  expect(within(hero).getByRole("link", { name: "View Work" })).toHaveAttribute(
    "href",
    "#projects",
  );
  expect(within(hero).getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "#contact",
  );

  for (const name of ["GitHub", "LinkedIn"]) {
    const socialLink = within(hero).getByRole("link", { name });
    expect(socialLink).toHaveAttribute("target", "_blank");
    expect(socialLink).toHaveAttribute("rel", "noopener noreferrer");
  }

  const portrait = within(hero).getByRole("img", {
    name: "Umesh Gangadharaiah",
  });
  const picture = portrait.closest("picture");
  const sources = picture?.querySelectorAll("source[type='image/webp']");
  expect(picture).not.toBeNull();
  expect(sources).toHaveLength(1);
  expect(sources?.[0]).toHaveAttribute(
    "srcset",
    expect.stringMatching(
      /umesh-gangadharaiah-320\.webp 320w, .*umesh-gangadharaiah-640\.webp 640w/u,
    ),
  );
  expect(sources?.[0]).toHaveAttribute("sizes", "(max-width: 46rem) 78vw, 28rem");
  expect(portrait).toHaveAttribute("width", "800");
  expect(portrait).toHaveAttribute("height", "800");
  expect(portrait).toHaveAttribute("loading", "eager");
  expect(portrait).toHaveAttribute("decoding", "async");
});

test("leads Impact with four agentic workflows before established outcomes", async () => {
  await renderPortfolio();
  const impact = screen.getByRole("region", { name: "Impact" });
  const spotlight = impact.querySelector<HTMLElement>(
    '[data-impact-outcome-id="agentic-engineering-automation"]',
  );
  const flows = Array.from(
    impact.querySelectorAll<HTMLElement>("[data-agentic-flow-id]"),
  );
  const establishedOutcomes = Array.from(
    impact.querySelectorAll<HTMLElement>("[data-established-outcome-id]"),
  );

  expect(spotlight).not.toBeNull();
  if (!spotlight) return;

  expect(spotlight).toHaveTextContent("AI-Assisted Engineering Workflows");
  expect(spotlight).toHaveTextContent("Up to 5–6×");
  expect(spotlight).toHaveTextContent("reported defect-resolution throughput");
  expect(
    flows.map((item) => item.dataset.agenticFlowId),
  ).toEqual([
    "defect-resolution",
    "feature-planning",
    "living-documentation",
    "simulation-validation",
  ]);
  expect(flows.map((item) => within(item).getByRole("heading").textContent)).toEqual([
    "Finding and fixing bugs",
    "Planning features before coding",
    "Documenting complex systems",
    "Simulating and validating behavior",
  ]);
  expect(spotlight).toHaveTextContent("sanitized");
  expect(spotlight).toHaveTextContent("human-reviewed");
  expect(spotlight).toHaveTextContent("implementation-ready");
  expect(spotlight).toHaveTextContent("deterministic");

  expect(
    within(impact).getByRole("heading", {
      name: "Earlier projects and results",
    }),
  ).toBeInTheDocument();
  expect(
    establishedOutcomes.map((item) => item.dataset.establishedOutcomeId),
  ).toEqual([
    "ndo-search-explore",
    "configuration-automation",
    "codeshift-cicd-platform",
  ]);
  expect(establishedOutcomes[0]).toHaveTextContent("Production-scale policy search");
  expect(establishedOutcomes[0]).toHaveTextContent("50,000+");
  expect(establishedOutcomes[0]).toHaveTextContent("Sub-second");
  expect(establishedOutcomes[0]).toHaveTextContent(
    "I indexed more than 50,000 policy objects and kept retrieval under one second.",
  );
  expect(establishedOutcomes[1]).toHaveTextContent(
    "Multi-server configuration automation",
  );
  expect(establishedOutcomes[1]).toHaveTextContent("300+ hours");
  expect(establishedOutcomes[1]).toHaveTextContent(
    "I automated repeatable server setup during my Staff Engineer internship, saving more than 300 hours of manual work.",
  );
  expect(establishedOutcomes[2]).toHaveTextContent("Self-service delivery platform");
  expect(establishedOutcomes[2]).toHaveTextContent("70%");
  expect(establishedOutcomes[2]).toHaveTextContent(
    "I built APIs for VM and resource allocation, reducing manual deployment effort by 70%.",
  );

  for (const [name, href] of [
    [
      "See how I use AI in engineering",
      "#project-agentic-engineering-automation",
    ],
    ["See Search & Explore", "#project-ndo-search-explore"],
    ["See the career milestone", "#career-cisco-staff-engineer-intern"],
    ["See the delivery platform", "#project-codeshift-cicd-platform"],
  ] as const) {
    expect(within(impact).getByRole("link", { name })).toHaveAttribute(
      "href",
      href,
    );
  }
});

test("renders every expertise area once as semantic source-ordered content", async () => {
  await renderPortfolio();
  const expertise = screen.getByRole("region", { name: "Expertise" });
  expect(
    within(expertise).getByRole("heading", { level: 2, name: "Expertise" }),
  ).toBeInTheDocument();
  const expectedAreas = [
    {
      id: "backend-systems",
      title: "Backend Engineer - Distributed Systems & Infrastructure",
      description:
        " Experienced backend engineer with hands-on expertise in designing and managing microservices within large-scale distributed systems. I’ve built reliable workflows, implemented robust configuration validation logic, and optimized deployment dependency resolution using graph algorithms. My work emphasizes maintaining consistency and correctness across services, handling complex interactions in distributed environments to ensure stability and reliability. With a keen eye for identifying critical flaws in architecture, I deliver scalable, low-impact solutions that support high-availability systems.",
      itemsLabel: "Tech stack:",
      items: ["Golang", "Python", "C++", "MongoDB", "Redis"],
    },
    {
      id: "generative-ai",
      title: "Exploring Generative AI & LLMs",
      description:
        "I'm a big fan of Generative AI and Large Language Models (LLMs), and I've had the chance to dive deep into these technologies through research and experimentation. My work focuses on improving LLMs' language understanding and responsiveness, while also deploying smaller models for internal tools to test new possibilities. Right now, I'm working on a proof of concept (PoC) to bring these AI solutions to life in exciting, real-world applications!",
      itemsLabel: "Tech stack & Papers:",
      items: [
        "SMALL LLMS FOR EDGE COMPUTING",
        "MULTI-STAGE FINE-TUNING PROCESS",
        "LangChain",
        "RAG",
        "Hugging Face",
        "LlamaIndex",
        "Streamlit",
      ],
    },
    {
      id: "devops-automation",
      title: "DevOps & Automation",
      description:
        "Beyond backend development, I bring a strong skill set in DevOps and internal automation. I’m skilled at building tools that boost team efficiency, like automating a custom Go-based code coverage framework to improve test visibility and streamline development workflows. I also write smart in-house scripts that bridge the gap between development and QA, handling tasks like upgrade, backup, and restore with zero manual hassle. My ability to think beyond just code—optimizing processes, reducing errors, and tightening release cycles—is a big part of how I help teams move faster and ship more reliably.",
      itemsLabel: "Tech stack:",
      items: ["SonarQube", "Docker", "Kubernetes", "Linux"],
    },
    {
      id: "engineering-tools",
      title: "Tools",
      description:
        "My approach with tools, services and platforms is hands-on, curiosity-driven, allowing me to be agile and adapt to the latest technology across development, automation and debugging workflows. I’ve used Docker and Kubernetes extensively for containerization and deployment, along with FastAPI, ReactJS, and HAProxy for building and managing robust microservices. For performance optimization, I’ve recently been leveraging Go’s pprof to profile and fine-tune services, leading to significant improvements in scale metrics. I’m also comfortable with databases like MongoDB, Redis, and ArangoDB, and often write internal scripts to improve developer productivity and system observability.",
      itemsLabel: "Tech stack:",
      items: [
        "VS Code",
        "Postman",
        "pprof",
        "Hugging Face",
        "LlamaIndex",
        "Streamlit",
      ],
    },
  ] as const;
  const cards = within(expertise).getAllByRole("article");

  expect(cards.map((card) => card.dataset.expertiseId)).toEqual(
    expectedAreas.map((area) => area.id),
  );

  for (const [index, area] of expectedAreas.entries()) {
    const card = cards[index];
    const title = within(card).getByRole("heading", {
      level: 3,
      name: area.title,
    });
    const normalizedDescription = area.description.trimStart();
    const sentenceEnd = normalizedDescription.search(/[.!?](?=\s|$)/u);
    const lead =
      sentenceEnd < 0
        ? normalizedDescription
        : normalizedDescription.slice(0, sentenceEnd + 1);
    const description = card.querySelector("details p");
    const disclosure = card.querySelector("details");
    const disclosureSummary = disclosure?.querySelector("summary");
    const icon = card.querySelector("svg[aria-hidden='true']");
    const itemLists = within(card).getAllByRole("list", {
      name: area.itemsLabel,
    });

    expect(title).toHaveAttribute("id", `${area.id}-heading`);
    expect(icon).toHaveAttribute("focusable", "false");
    expect(within(card).getByText(lead, { selector: "p" })).toBeVisible();
    expect(
      `${lead} ${description?.textContent ?? ""}`,
    ).toBe(area.description.trimStart());
    expect(disclosure).not.toHaveAttribute("open");
    expect(disclosureSummary).toHaveAccessibleName(
      `Read full description for ${area.title}`,
    );
    expect(itemLists).toHaveLength(1);
    expect(
      within(itemLists[0]).getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(area.items);
  }

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
    expect(publication).toHaveAttribute("href", href);
    expect(publication).toHaveAttribute("target", "_blank");
    expect(publication).toHaveAttribute("rel", "noopener noreferrer");
  }

  expect(
    expertise.querySelector(
      ".skills-container, .flex-chips, .MuiChip-root, .MuiChip-label",
    ),
  ).toBeNull();
});

test("renders all career entries as one complete ordered timeline", async () => {
  await renderPortfolio();
  const career = screen.getByRole("region", { name: "Career" });
  expect(
    within(career).getByRole("heading", { level: 2, name: "Career" }),
  ).toBeInTheDocument();
  const orderedTimeline = career.querySelector("ol");
  const expectedEntries = [
    {
      id: "cisco-senior-software-engineer",
      role: "Senior Software Engineer",
      period: "Oct 2025 – Present",
      summary:
        "Agentic engineering, developer automation, feature development, and bug resolution",
      technologies: [
        "AI Agents",
        "Reusable Skills",
        "Model Context Protocol (MCP)",
        "LLMs",
      ],
      highlights: [
        "Build multiple AI agents, reusable Skills, and Model Context Protocol (MCP) integrations to automate day-to-day engineering tasks",
        "Drive feature development through agent-assisted workflows spanning implementation, validation, and delivery",
        "Use AI agents to investigate and resolve software defects, increasing bug-resolution throughput by up to 5–6× per engineer and across the wider team",
      ],
    },
    {
      id: "cisco-software-engineer-iii",
      role: "Software Engineer III",
      period: "Aug 2024 – Sep 2025",
      summary:
        "Backend feature ownership for NexusOne across distributed systems integration, automated validation, and release readiness",
      technologies: [
        "Golang",
        "Microservices",
        "Distributed Systems",
        "Network Automation",
        "Automated Testing",
      ],
      highlights: [
        "I helped deliver a major NexusOne networking capability with a broader engineering team and owned substantial backend work through implementation and release integration",
        "I contributed to distributed workflows and service integration across the capability’s lifecycle, with an emphasis on consistent state and reliable behavior",
        "I strengthened reliability across lifecycle and topology scenarios through recovery-focused engineering, integration fixes, and hands-on validation",
        "I built broad automated test coverage and engineering documentation to support release readiness and continued hardening",
      ],
    },
    {
      id: "cisco-software-engineer-ii",
      role: "Software Engineer II",
      period: "Aug 2022 – Jul 2024",
      technologies: [
        "Golang",
        "Docker",
        "Microservices",
        "APIC",
        "Graph Algorithms",
      ],
      highlights: [
        "Integrated L4-L7 service graphs into NDO for simplified workflows",
        "Owned two microservices validating and converting configs into APIC MO format",
        "Enhanced deployment cycle detection using graph algorithms",
        "Fixed critical multisite design flaw affecting data center sync",
        "Reduced release-phase bugs to near-zero through extensive QA & dev work",
      ],
    },
    {
      id: "cisco-staff-engineer-intern",
      role: "Staff Engineer Intern",
      period: "Aug 2021 – Jul 2022",
      technologies: ["React", "Python", "FastAPI", "Docker"],
      highlights: [
        "Built Resource Allocation Manager (RAM) for staffing automation",
        "Created chatbot (CURI) for internal queries using Webex APIs",
        "Automated multiserver configurations saving 300+ hours",
      ],
    },
    {
      id: "cisco-intern",
      role: "Intern",
      period: "Jan 2021 – Jul 2021",
      technologies: [
        "Infrastructure Automation",
        "Internal Tooling",
        "Web UI Development",
      ],
      highlights: [
        "Designed and developed a UCS configuration automation tool, reducing manual effort and increasing efficiency",
        "Built an internal React-based web UI with form validation and API integration to standardize data input",
      ],
    },
  ] as const;

  expect(orderedTimeline).not.toBeNull();
  const entries = Array.from(orderedTimeline?.children ?? []);
  expect(entries).toHaveLength(5);
  expect(entries.every((entry) => entry.tagName === "LI")).toBe(true);
  expect(entries.map((entry) => entry.getAttribute("data-career-id"))).toEqual(
    expectedEntries.map((entry) => entry.id),
  );

  for (const [index, expected] of expectedEntries.entries()) {
    const entry = entries[index] as HTMLElement;

    expect(
      within(entry).getByRole("heading", { level: 3, name: expected.role }),
    ).toBeInTheDocument();
    expect(within(entry).getByText("Cisco Systems")).toBeInTheDocument();
    expect(within(entry).getByText("IN")).toBeInTheDocument();
    expect(within(entry).getByText(expected.period)).toBeInTheDocument();

    if ("summary" in expected) {
      expect(within(entry).getByText(expected.summary)).toBeInTheDocument();
    }

    if (expected.technologies.length > 0) {
      expect(
        within(entry)
          .getByRole("list", { name: "Technologies" })
          .querySelectorAll(":scope > li"),
      ).toHaveLength(expected.technologies.length);
      expect(
        within(within(entry).getByRole("list", { name: "Technologies" }))
          .getAllByRole("listitem")
          .map((item) => item.textContent),
      ).toEqual(expected.technologies);
    } else {
      expect(
        within(entry).queryByRole("heading", { name: "Technologies" }),
      ).not.toBeInTheDocument();
    }

    if (expected.highlights.length > 0) {
      expect(
        within(within(entry).getByRole("list", { name: "Highlights" }))
          .getAllByRole("listitem")
          .map((item) => item.textContent),
      ).toEqual(expected.highlights);
    } else {
      expect(
        within(entry).queryByRole("heading", { name: "Highlights" }),
      ).not.toBeInTheDocument();
    }
  }

  expect(
    within(career).getByText(
      "Automated multiserver configurations saving 300+ hours",
    ),
  ).toBeInTheDocument();
});

test("keeps representative project and recognition content discoverable through expanded views", async () => {
  await renderPortfolio();

  expect(
    screen.queryByRole("heading", { name: "Telegram as Data Storage" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "View all 13 projects" }),
  );

  const archivedProject = document.querySelector<HTMLElement>(
    '[data-project-id="telegram-data-storage"]',
  );
  expect(archivedProject).not.toBeNull();
  expect(
    within(archivedProject!).getByRole("heading", {
      name: "Telegram as Data Storage",
    }),
  ).toBeInTheDocument();
  expect(archivedProject).toHaveTextContent(
    "Personal project that uses Telegram chats as an ad-hoc storage service. Designed as a lightweight backup system for data dump using Telegram APIs and automation.",
  );

  expect(
    document.querySelector('[data-recognition-id="yogi-070422"]'),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "All (25)" }));

  const archivedRecognition = document.querySelector<HTMLElement>(
    '[data-recognition-id="yogi-070422"]',
  );
  expect(archivedRecognition).not.toBeNull();
  expect(
    within(archivedRecognition!).getByRole("heading", {
      name: "Innovation: Internal Tool",
    }),
  ).toBeInTheDocument();
  expect(archivedRecognition).toHaveTextContent(
    "Thank you so much for your contributions to Codeshift till date, with your invaluable efforts we have been able to take it from an Idea to a functional platform in very short time!",
  );
  expect(within(archivedRecognition!).getByText("7 April 2022")).toHaveAttribute(
    "datetime",
    "2022-04-07",
  );
});

test("keeps all five navigation destinations as real anchors", async () => {
  await renderPortfolio();
  const navigation = screen.getByRole("navigation", { hidden: true });
  expect(navigation).toHaveAttribute("aria-label", "Primary navigation");

  expect(
    within(navigation)
      .getAllByRole("link", { hidden: true })
      .map((link) => link.getAttribute("href")),
  ).toEqual([
    "#expertise",
    "#experience",
    "#projects",
    "#recognition",
    "#contact",
  ]);
});

test("renders remote image records as a plain intrinsic image", () => {
  const remoteImage = {
    kind: "remote",
    alt: "Remote project preview",
    src: "https://example.com/project.png",
    width: 1200,
    height: 675,
  } as const satisfies RemoteImageAsset;

  render(<ResponsivePortfolioImage image={remoteImage} loading="lazy" />);

  const image = screen.getByRole("img", { name: remoteImage.alt });
  expect(image.closest("picture")).toBeNull();
  expect(image).toHaveAttribute("src", remoteImage.src);
  expect(image).toHaveAttribute("width", "1200");
  expect(image).toHaveAttribute("height", "675");
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image).toHaveAttribute("decoding", "async");
});

test("combines local WebP candidates into one responsive source", () => {
  const localImage = {
    kind: "local",
    alt: "Local project preview",
    fallbackSrc: "/project.png",
    sources: [
      { src: "/project-480.webp", width: 480, type: "image/webp" },
      { src: "/project-960.webp", width: 960, type: "image/webp" },
    ],
    width: 1200,
    height: 675,
  } as const satisfies LocalImageAsset;
  const { rerender } = render(
    <ResponsivePortfolioImage image={localImage} loading="lazy" />,
  );

  const image = screen.getByRole("img", { name: localImage.alt });
  const picture = image.closest("picture");
  expect(picture?.querySelectorAll("source")).toHaveLength(1);
  expect(picture?.querySelector("source")).toHaveAttribute(
    "srcset",
    "/project-480.webp 480w, /project-960.webp 960w",
  );
  expect(picture?.querySelector("source")).toHaveAttribute("sizes", "100vw");
  expect(image).toHaveAttribute("src", localImage.fallbackSrc);
  expect(image).toHaveAttribute("width", "1200");
  expect(image).toHaveAttribute("height", "675");
  expect(image).toHaveAttribute("loading", "lazy");

  rerender(
    <ResponsivePortfolioImage
      image={localImage}
      loading="eager"
      sizes="(max-width: 40rem) 90vw, 30rem"
    />,
  );

  expect(picture?.querySelector("source")).toHaveAttribute(
    "sizes",
    "(max-width: 40rem) 90vw, 30rem",
  );
  expect(image).toHaveAttribute("loading", "eager");
});

test("footer reuses named social links and preserves the original statement as text", async () => {
  await renderPortfolio();
  const footer = screen.getByRole("contentinfo");

  expect(within(footer).getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(within(footer).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(footer).toHaveTextContent(
    "A portfolio designed & built by Umesh Gangadharaiah with 💜",
  );
  expect(
    within(footer).queryByRole("link", { name: "Umesh Gangadharaiah" }),
  ).not.toBeInTheDocument();
});
