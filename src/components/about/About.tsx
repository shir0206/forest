"use client";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./about.scss";
import { Icon } from "../icon/Icon";

interface AboutProps {
  position: [number, number, number];
}

export default function About({ position }: AboutProps) {
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // Center the butterfly at the 3D location point
      wrapperClass="info-container" // Wrapper class for setting the base size
      distanceFactor={2} // Determines the amount of change in size when zooming in/out
      scale={[0.005, 0.005, 0.005]} // Adjust the size of the butterfly within the scene
    >
      <div className="landing-body">
        <div className="container">
          <header>
            <h1 className="greeting">Nice to meet you!</h1>
            <div className="intro">
              I'm <strong>Shir Zabolotny</strong>
            </div>
            <div className="subtitle">A web developer</div>
          </header>

          <div className="skills">
            <div className="skill-circle">
              <Icon name="design" className="skill-icon" />
              <div className="skill-label">Design</div>
            </div>

            <div className="skill-circle">
              <Icon name="architecture" className="skill-icon" />
              <div className="skill-label">Architecture</div>
            </div>

            <div className="skill-circle">
              <Icon name="ux" className="skill-icon" />
              <div className="skill-label">
                User
                <br />
                Experience
              </div>
            </div>
          </div>

          <div className="tagline">
            who weaves together design,
            <br />
            architecture, and user experience.
          </div>

          <div className="separator-line"></div>

          <div className="philosophy">
            To me, a website is more than code or visuals. It should tell your
            brand's story with clarity and turn visitors into believers in what
            you do.
          </div>

          <div className="features">
            <div className="feature-wrapper">
              <div className="feature">
                <Icon name="experience" className="feature-icon" />
                <div className="feature-text">
                  With hands-on experience at leading tech companies and MSc in
                  Information Systems, I turn complex ideas into functional
                  realities through clean code, thoughtful design, and true
                  collaboration.
                </div>
              </div>
              <div className="separator-line"></div>
            </div>

            <div className="feature-wrapper">
              <div className="feature">
                <Icon name="balance" className="feature-icon" />
                <div className="feature-text">
                  Each project is a dialogue: balancing what inspires you with
                  what serves your audience, creativity with strategy, vision
                  with impact.
                </div>
              </div>
              <div className="separator-line"></div>
            </div>
          </div>

          <div className="cta">
            <div className="cta-text">
              Let's create together something that makes you unique
              <br />
              and helps your business grow
            </div>

            <div className="contact-buttons">
              <a
                href="https://www.linkedin.com"
                className="contact-btn linkedin-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="linkedin" className="btn-icon" />
                <span>LINKEDIN LINK</span>
              </a>

              <a
                href="mailto:contact@example.com"
                className="contact-btn email-btn"
              >
                <Icon name="mail" className="btn-icon" />
                <span>MAIL LINK</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}
