"use client";
import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./info.scss";

export default function Info({ position }) {
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // מרכז את הפרפר בנקודת המיקום התלת-ממדית
      wrapperClass="info-container" // קלאס עוטף לצורך הגדרת גודל בסיס
      distanceFactor={2} // קובע את מידת השינוי בגודל בעת התרחקות/התקרבות
      scale={[0.005, 0.005, 0.005]} // התאמת גודל הפרפר בתוך הסצנה
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
              <div className="skill-icon">💻</div>
              <div className="skill-label">Design</div>
            </div>

            <div className="connector"></div>

            <div className="skill-circle">
              <div className="skill-icon">🏛️</div>
              <div className="skill-label">Architecture</div>
            </div>

            <div className="connector"></div>

            <div className="skill-circle">
              <div className="skill-icon">👤</div>
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

          <div className="philosophy">
            To me, a website is more than code or visuals. It should tell your
            brand's story with clarity and turn visitors into believers in what
            you do.
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">✏️</div>
              <div className="feature-text">
                With hands-on experience at leading tech companies and MSc in
                Information Systems, I turn complex ideas into functional
                realities through clean code, thoughtful design, and true
                collaboration.
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">⚖️</div>
              <div className="feature-text">
                Each project is a dialogue: balancing what inspires you with
                what serves your audience, creativity with strategy, vision with
                impact.
              </div>
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
              >
                <span className="btn-icon">in</span>
                <span>LINKEDIN LINK</span>
              </a>

              <a
                href="mailto:contact@example.com"
                className="contact-btn email-btn"
              >
                <span className="btn-icon">✉️</span>
                <span>MAIL LINK</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}
