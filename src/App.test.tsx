import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import App from "./App";
import ResponsivePortfolioImage from "./components/ResponsivePortfolioImage";
import type { LocalImageAsset, RemoteImageAsset } from "./content/models";
import globalCss from "./styles/global.css?raw";

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
  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeInTheDocument();
  const mainLandmark = screen.getByRole("main");
  expect(mainLandmark).toHaveAttribute("id", "main-content");
  expect(mainLandmark).toHaveAttribute("tabindex", "-1");
  mainLandmark.focus();
  expect(mainLandmark).toHaveFocus();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Umesh Gangadharaiah",
    }),
  ).toBeInTheDocument();

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
  expect(portrait.closest("picture")).not.toBeNull();
  expect(portrait.closest("picture")?.querySelectorAll("source")).toHaveLength(0);
  expect(portrait).toHaveAttribute("width", "800");
  expect(portrait).toHaveAttribute("height", "800");
  expect(portrait).toHaveAttribute("loading", "eager");
  expect(portrait).toHaveAttribute("decoding", "async");
});

test("renders the four typed impact metrics in their source order", async () => {
  await renderPortfolio();
  const impact = screen.getByRole("region", { name: "Impact" });

  expect(within(impact).getAllByRole("listitem").map((item) => item.textContent)).toEqual(
    [
      "50,000+policy objects indexed",
      "Sub-secondpolicy retrieval",
      "300+ hoursmanual effort saved",
      "70%manual effort reduced",
    ],
  );
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
    const description = title.nextElementSibling;
    const itemLists = within(card).getAllByRole("list", {
      name: area.itemsLabel,
    });

    expect(description?.tagName).toBe("P");
    expect(description?.textContent).toBe(area.description);
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
      id: "cisco-software-engineer-iii",
      role: "Software Engineer III",
      period: "Aug 2024 – Present",
      summary:
        "Network Backend development, GenAI/LLM, Mentorship and Feature owner",
      technologies: [],
      highlights: [],
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
  expect(entries).toHaveLength(4);
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
  expect(career.querySelector(".vertical-timeline, .MuiChip-root")).toBeNull();
});

test("keeps all five navigation destinations as real anchors", async () => {
  await renderPortfolio();
  const navigation = screen.getByRole("navigation", {
    name: "Primary navigation",
  });

  expect(
    within(navigation)
      .getAllByRole("link")
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

test("temporarily corrects only known light-theme legacy foregrounds", () => {
  expect(globalCss).toMatch(
    /html\[data-theme="light"\] \.skills-container svg,[\s\S]*html\[data-theme="light"\] \.flex-chips \.chip-title\s*\{[^}]*color:\s*var\(--color-text\);/,
  );
  expect(globalCss).toMatch(
    /html\[data-theme="light"\] \.vertical-timeline span,[\s\S]*html\[data-theme="light"\] \.vertical-timeline-element-date\s*\{[^}]*color:\s*var\(--color-text-muted\);/,
  );
  expect(globalCss).not.toMatch(
    /html\[data-theme="light"\]\s+\.vertical-timeline\s+\*/,
  );
  expect(globalCss).not.toMatch(
    /html\[data-theme="light"\] \.svg-inline--fa\s*\{/,
  );
  expect(globalCss).toMatch(
    /html\[data-theme="light"\] \.vertical-timeline-element-icon \.svg-inline--fa\s*\{[^}]*color:\s*var\(--color-accent-contrast\);/,
  );
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
