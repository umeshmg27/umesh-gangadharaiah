import type { ExpertiseArea } from "./models";

export const expertiseAreas = [
  {
    id: "backend-systems",
    title: "Backend Engineer - Distributed Systems & Infrastructure",
    description:
      " Experienced backend engineer with hands-on expertise in designing and managing microservices within large-scale distributed systems. I’ve built reliable workflows, implemented robust configuration validation logic, and optimized deployment dependency resolution using graph algorithms. My work emphasizes maintaining consistency and correctness across services, handling complex interactions in distributed environments to ensure stability and reliability. With a keen eye for identifying critical flaws in architecture, I deliver scalable, low-impact solutions that support high-availability systems.",
    itemsLabel: "Tech stack:",
    items: [
      { label: "Golang" },
      { label: "Python" },
      { label: "C++" },
      { label: "MongoDB" },
      { label: "Redis" },
    ],
  },
  {
    id: "generative-ai",
    title: "Exploring Generative AI & LLMs",
    description:
      "I'm a big fan of Generative AI and Large Language Models (LLMs), and I've had the chance to dive deep into these technologies through research and experimentation. My work focuses on improving LLMs' language understanding and responsiveness, while also deploying smaller models for internal tools to test new possibilities. Right now, I'm working on a proof of concept (PoC) to bring these AI solutions to life in exciting, real-world applications!",
    itemsLabel: "Tech stack & Papers:",
    items: [
      {
        label: "SMALL LLMS FOR EDGE COMPUTING",
        url: "https://www.tdcommons.org/dpubs_series/7086/",
      },
      {
        label: "MULTI-STAGE FINE-TUNING PROCESS",
        url: "https://www.tdcommons.org/dpubs_series/7085/",
      },
      { label: "LangChain" },
      { label: "RAG" },
      { label: "Hugging Face" },
      { label: "LlamaIndex" },
      { label: "Streamlit" },
    ],
  },
  {
    id: "devops-automation",
    title: "DevOps & Automation",
    description:
      "Beyond backend development, I bring a strong skill set in DevOps and internal automation. I’m skilled at building tools that boost team efficiency, like automating a custom Go-based code coverage framework to improve test visibility and streamline development workflows. I also write smart in-house scripts that bridge the gap between development and QA, handling tasks like upgrade, backup, and restore with zero manual hassle. My ability to think beyond just code—optimizing processes, reducing errors, and tightening release cycles—is a big part of how I help teams move faster and ship more reliably.",
    itemsLabel: "Tech stack:",
    items: [
      { label: "SonarQube" },
      { label: "Docker" },
      { label: "Kubernetes" },
      { label: "Linux" },
    ],
  },
  {
    id: "engineering-tools",
    title: "Tools",
    description:
      "My approach with tools, services and platforms is hands-on, curiosity-driven, allowing me to be agile and adapt to the latest technology across development, automation and debugging workflows. I’ve used Docker and Kubernetes extensively for containerization and deployment, along with FastAPI, ReactJS, and HAProxy for building and managing robust microservices. For performance optimization, I’ve recently been leveraging Go’s pprof to profile and fine-tune services, leading to significant improvements in scale metrics. I’m also comfortable with databases like MongoDB, Redis, and ArangoDB, and often write internal scripts to improve developer productivity and system observability.",
    itemsLabel: "Tech stack:",
    items: [
      { label: "VS Code" },
      { label: "Postman" },
      { label: "pprof" },
      { label: "Hugging Face" },
      { label: "LlamaIndex" },
      { label: "Streamlit" },
    ],
  },
] as const satisfies readonly ExpertiseArea[];

export type ExpertiseAreaId = (typeof expertiseAreas)[number]["id"];
