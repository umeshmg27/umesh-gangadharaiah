import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ProfileImage from '../assets/images/umesh-ug.jpg'
import '../assets/styles/Main.scss';

function Main() {

  return (
    <div className="container">
      <div className="about-section">
        <div className="image-wrapper">
          <img src={ProfileImage} alt="Avatar" />
        </div>
        <div className="content">
          <div className="social_icons">
            <a href="https://github.com/umeshmg27" target="_blank" rel="noreferrer"><GitHubIcon/></a>
            <a href="https://www.linkedin.com/in/umeshmg/" target="_blank" rel="noreferrer"><LinkedInIcon/></a>
          </div>
          <h1>Umesh </h1>
          <h2>Gangadharaiah</h2>
          <p>Backend Engineer</p>
          <p>Distributed Systems & Infrastructure</p>

          <div className="mobile_social_icons">
            <a href="https://github.com/umeshmg27" target="_blank" rel="noreferrer"><GitHubIcon/></a>
            <a href="https://www.linkedin.com/in/umeshmg/" target="_blank" rel="noreferrer"><LinkedInIcon/></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;