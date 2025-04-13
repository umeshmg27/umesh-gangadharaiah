import React from "react";
import '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import '../assets/styles/Timeline.scss'
import Chip from '@mui/material/Chip';

const SoftwareIntern = [
  "VsCode",
  "PostMan",
  "PProf",
  "Hugging Face",
  "LlamaIndex",
  "Streamlit",
];

const SoftwareEngineerI = [
  "VsCode",
  "PostMan",
  "PProf",
  "Hugging Face",
  "LlamaIndex",
  "Streamlit",
];

const SoftwareEngineerII = [
  "Golang",
  "Docker",
  "Microservices",
  "Cisco Nexus Dashboard Orchestrator",
  "Cisco-APIC",
  "Graph Algorithms"
];

const SoftwareEngineerIII = [
  "VsCode",
  "PostMan",
  "PProf",
  "Hugging Face",
  "LlamaIndex",
  "Streamlit",
];


function Timeline() {
  return (
    <div id="experience">
      <div className="items-container">
        <h1>Career </h1>
        <VerticalTimeline>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'white', color: 'rgb(39, 40, 34)' }}
            contentArrowStyle={{ borderRight: '7px solid  white' }}
            date="Aug,2024 - present"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineer III</h3>
            <h4 className="vertical-timeline-element-subtitle">Cisco Systems, IN</h4>
            <p>
             Network Backend development, GenAI/LLM, Mentorship and Feature owner
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Aug,2022 - July,2024"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Software Engineer II</h3>
            <h4 className="vertical-timeline-element-subtitle">Cisco Systems, IN</h4>
            <p>
              <p>
                
                Golang, Docker, Microservices, APIC, Graph Algorithms<br />
                <br/>
                • Integrated L4-L7 service graphs into NDO for simplified workflows<br />
                • Owned two microservices validating and converting configs into APIC MO format<br />
                • Enhanced deployment cycle detection using graph algorithms<br />
                • Fixed critical multisite design flaw affecting data center sync<br />
                • Reduced release-phase bugs to near-zero through extensive QA & dev work
              </p>
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Aug,2021 - July,2022"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Staff Engineer Intern</h3>
            <h4 className="vertical-timeline-element-subtitle">Cisco Systems, IN</h4>
            <p>
              React, Python, FastAPI, Docker<br />
              • Built Resource Allocation Manager (RAM) for staffing automation<br />
              • Created chatbot (CURI) for internal queries using Webex APIs<br />
              • Automated multiserver configurations saving 300+ hours
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Jan,2021 - July,2021"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Intern</h3>
            <h4 className="vertical-timeline-element-subtitle">Cisco Systems, IN</h4>
            <p>
              Infrastructure Automation, Internal Tooling, Web UI Development<br />
              • Designed and developed a UCS configuration automation tool, reducing manual effort and increasing efficiency<br />
              • Built an internal React-based web UI with form validation and API integration to standardize data input
            </p>

          </VerticalTimelineElement>
        </VerticalTimeline>
      </div>
    </div>
  );
}

export default Timeline;