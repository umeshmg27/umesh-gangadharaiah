import React from "react";
import '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDocker, faPython, faGolang } from '@fortawesome/free-brands-svg-icons';
import Chip from '@mui/material/Chip';
import '../assets/styles/Expertise.scss';
import { faLink, faTools } from "@fortawesome/free-solid-svg-icons";

const labelsFirst = [
    "Golang",
    "Python",
    "C++",
    "MongoDB",
    "Redis",
];

const labelsSecond = [
    "Sonar Cube",
    "Docker",
    "Kubernetes",
    "Linux",
];

const labelsThird = [
    "VsCode",
    "PostMan",
    "PProf",
    "Hugging Face",
    "LlamaIndex",
    "Streamlit",
];

const labelsFourth = [
    { label: "SMALL LLMS FOR EDGE COMPUTING", url: "https://www.tdcommons.org/dpubs_series/7086/" },
    { label: "MULTI-STAGE FINE-TUNING PROCESS", url: "https://www.tdcommons.org/dpubs_series/7085/" },
    "LangChain",
    "RAG",
    "Hugging Face",
    "LlamaIndex",
    "Streamlit"
];

function Expertise() {
    return (
        <div className="container" id="expertise">
            <div className="skills-container">
                <h1>Expertise</h1>
                <div className="skills-grid">
                    <div className="skill">
                        <FontAwesomeIcon icon={faGolang} size="3x" />

                        <h3>Backend Engineer - Distributed Systems & Infrastructure</h3>
                        <p> Experienced backend engineer with hands-on expertise in designing and managing microservices within large-scale distributed systems. I’ve built reliable workflows, implemented robust configuration validation logic, and optimized deployment dependency resolution using graph algorithms. My work emphasizes on maintaining consistency and correctness across services, handling complex interactions in distributed environments to ensure stability and reliability. With a keen eye for identifying critical flaws in architecture, I deliver scalable, low-impact solutions that support high-availability systems.</p>
                        <div className="flex-chips">
                            <span className="chip-title">Tech stack:</span>
                            {labelsFirst.map((label, index) => (
                                <Chip key={index} className='chip' label={label} />
                            ))}
                        </div>
                    </div>
                    <div className="skill">
                        <FontAwesomeIcon icon={faPython} size="3x" />
                        <h3>Exploring Generative AI & LLMs</h3>
                        <p>I'm a big fan of Generative AI and Large Language Models (LLMs), and I've had the chance to dive deep into these technologies through research and experimentation. My work focuses on improving LLMs' language understanding and responsiveness, while also deploying smaller models for internal tools to test new possibilities. Right now, I'm working on a proof of concept (PoC) to bring these AI solutions to life in exciting, real-world applications!</p>
                        <div className="flex-chips">
                            <span className="chip-title">Tech stack & Papers:</span>
                            {labelsFourth.map((item, index) => (
                                typeof item === 'object' ? (
                                    <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="chip-link">
                                        <Chip className='chip' label={item.label} />
                                        <FontAwesomeIcon icon={faLink} className="chip-icon" />
                                    </a>
                                ) : (
                                    <Chip key={index} className='chip' label={item} />
                                )
                            ))}
                        </div>
                    </div>

                    <div className="skill">
                        <FontAwesomeIcon icon={faDocker} size="3x" />
                        <h3>DevOps & Automation</h3>
                        <p>Beyond backend development, I bring a strong skillset in DevOps and internal automation. I’m skilled at building tools that boost team efficiency like automating a custom Go-based code coverage framework to improve test visibility and streamline development workflows. I also write smart in-house scripts that bridge the gap between development and QA, handling tasks like upgrade, backup, and restore with zero manual hassle. My ability to think beyond just code - optimizing processes, reducing errors, and tightening release cycles, is a big part of how I help teams move faster and ship more reliably.</p>
                        <div className="flex-chips">
                            <span className="chip-title">Tech stack:</span>
                            {labelsSecond.map((label, index) => (
                                <Chip key={index} className='chip' label={label} />
                            ))}
                        </div>
                    </div>

                    <div className="skill">
                        <FontAwesomeIcon icon={faTools} size="3x" />
                        <h3>Tools</h3>
                        <p>My approach with tools, services and platforms is hands-on curiosity driven, allowing me to be agile and adapt to the latest technology across development, automation and debugging workflows. I’ve used Docker and Kubernetes extensively for containerization and deployment, along with FastAPI, ReactJS, and HAProxy for building and managing robust microservices. For performance optimization, I’ve recently been leveraging Go’s pprof to profile and fine-tune services, leading to significant improvements in scale metrics. I’m also comfortable with databases like MongoDB, Redis, and ArangoDB, and often write internal scripts to improve developer productivity and system observability.</p>
                        <div className="flex-chips">
                            <span className="chip-title">Tech stack:</span>
                            {labelsThird.map((label, index) => (
                                <Chip key={index} className='chip' label={label} />
                            ))}
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
}

export default Expertise;