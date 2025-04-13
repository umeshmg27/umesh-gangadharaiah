import React, { useEffect,useState } from 'react';
import mock01 from '../assets/images/mock01.png';
import mock02 from '../assets/images/mock02.png';
import mock03 from '../assets/images/mock03.png';
import mock04 from '../assets/images/mock04.png';
import mock05 from '../assets/images/mock05.png';
import mock06 from '../assets/images/mock06.png';
import mock07 from '../assets/images/mock07.png';
import mock08 from '../assets/images/mock08.png';
import mock09 from '../assets/images/mock09.png';
import mock10 from '../assets/images/mock10.png';
import '../assets/styles/Project.scss';
import { Height } from '@mui/icons-material';



function Project() {
   
    return (
        <div className="projects-container" id="projects">
      <h1>Projects</h1>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div className="project" key={index}>
            <div className="project-img-wrapper">
              <a href={project.href} target="_blank" rel="noreferrer">
                <img src={project.image} className="zoom" alt="thumbnail" width="100%" style={{height: "25rem"}}/>
              </a>
            </div>
            <a href={project.href} target="_blank" rel="noreferrer">
              <h2>{project.title}</h2>
            </a>
            <p>
                {project.description}
            </p>
            
          </div>
        ))}
      </div>
     

    </div>
    );
}

const projects = [
    {
        title: "ND- AlphaX",
        description: "Part of Desigin team, developing a key product feature that would shape the future of datacenter networking.",
        image: "/my-portfolio/assets/images/data-center.png",
        href: "#"
      },
    {
      title: "NDO - Search & Explore Feature",
      description: "Designed and implemented an advanced Search & Explore feature for Cisco NDO's configurable policy objects while leading a team of two. Engineered efficient indexing strategies across multiple MongoDB collections to enable high-speed autocomplete and deep object retrieval. Optimized query execution by extending search capabilities across three distinct collections with unified logic. Conducted extensive scalability testing with datasets of over 50,000 policy objects, consistently achieving retrieval times under one second, ensuring robust performance in production-scale environments.",
      image: "https://www.cisco.com/c/dam/en/us/td/i/500001-600000/500001-510000/adoc-ndi-651/ndi-search-explore.jpg",
      href: "#"
    },
    {
      title: "Unified Backup and Restore - Cisco Nexus Dashboard",
      description: "Designed and implemented a clean backup and restore workflow for Cisco’s Unified Product Suite, covering NDO, NDI, and NDFC. Leveraged Kubernetes ConfigMaps to communicate real-time status between services during backup and restore operations. Performed extensive validation of backup archives to ensure integrity and consistency across product configurations. Utilized Golang goroutines to enable concurrent restore tasks, allowing seamless and efficient parallel recovery of components from a single backup source—significantly improving resilience and reducing recovery time in production environments.",
      image: "/my-portfolio/assets/images/restore.png",
      href: "#"
    },
    {
      title: "Cisco NDO - Simplified L4L7 Service Chaining",
      description: "Part of the development team focused on simplifying L4-L7 service chaining across sites using Cisco's Nexus Dashboard Orchestrator (NDO). Worked on validating user configurations and converting them into APIC Managed Object (MO) API requests. Contributed significantly to two distinct microservices within the NDO ecosystem, ensuring seamless orchestration and integration.",
      image: "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png",
      href: "https://www.cisco.com/c/dam/en/us/products/collateral/cloud-systems-management/multi-site-orchestrator/nb-06-mso-so-cte-en.docx/_jcr_content/renditions/nb-06-mso-so-cte-en_0.png"
    },
    {
      title: "Cisco ACI - Advanced PBR Features",
      description: "Contributed to feature development of Service Graphs in ACI, including Symmetric, Intra-VRF, and Location-Aware PBR. Delivered scalable and secure traffic redirection solutions integrated with firewalls and load balancers.",
      image: "https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/white-paper-c11-743107.docx/_jcr_content/renditions/white-paper-c11-743107_11.png",
      href: "https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/white-paper-c11-743107.docx/_jcr_content/renditions/white-paper-c11-743107_11.png"
    },
    {
      title: "Codeshift - CI/CD Platform",
      description: "Developed a Continuous Delivery platform to deploy internal applications with FastAPI and React. Created REST APIs for VM and resource allocation, reducing manual deployment effort by 70%.",
      image: "/my-portfolio/assets/images/codeshift.png",
      href: "#"
    },
    {
      title: "Resource Allocation Manager (RAM)",
      description: "Designed and developed RAM—an internal tool for project staffing. Reduced overhead tasks by 40% and cut allocation time by 60%. Awarded Bronze Stevie for innovation in HR software.",
      image: mock05,
      href: "#"
    },
    {
      title: "Kollect & CURI - Internal Knowledge Bot",
      description: "Led a 5-person team to build a chatbot that parses internal Webex threads and indexes team knowledge. Integrated with MongoDB, Docker, and webhooks to track team queries efficiently.",
      image: mock04,
      href: "#"
    },
    {
      title: "UCS Config Tool",
      description: "Proposed and built a tool to automate UCS server configurations. Enabled configuration of banners, DNS, SNMP, logs, etc., and generated formatted reports for customers using React and Python.",
      image:"/my-portfolio/assets/images/config.png",
      href: "#"
    },
    {
      title: "Dementia Detection via EEG (IEEE)",
      description: "Co-authored and published a research paper on dementia detection through EEG analysis. Presented at IEEE conference with promising accuracy using early-stage patient data.",
      image: "/my-portfolio/assets/images/ieee.png",
      href: "https://ieeexplore.ieee.org/document/9641661"
    },
    {
      title: "Flikrify",
      description: "Lead Backend Developer for a cross-platform social app focused on simplifying group communication. Designed and launched in 5 months using Golang, Redis, ArangoDB, and GenAI. Live on Android, iOS, and MacOS.",
      image:"/my-portfolio/assets/images/flikr.png",
      href: "https://play.google.com/store/apps/details?id=live.flikr.walle&pcampaignid=web_share"
    },
    {
      title: "Telegram as Data Storage",
      description: "Personal project that uses Telegram chats as an ad-hoc storage service. Designed as a lightweight backup system for data dump using Telegram APIs and automation.",
      image: "/my-portfolio/assets/images/telegram.png",
      href: "https://github.com/umeshmg27/Telegram-as-Data-Storage"
    },
  ];

export default Project;