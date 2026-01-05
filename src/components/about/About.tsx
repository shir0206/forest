import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./about.scss";
import { Icon } from "../icon/Icon";
import { ContactButtons } from "./ContactButtons";
import linksConfig from "@/helper/linksConfig.json";

interface AboutProps {
  position: [number, number, number];
  closeAbout: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function About({ position, closeAbout }: AboutProps) {
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // Center the butterfly at the 3D location point
      wrapperClass="info-container" // Wrapper class for setting the base size
      distanceFactor={2} // Determines the amount of change in size when zooming in/out
      scale={[0.005, 0.005, 0.005]} // Adjust the size of the about box within the scene
    >
      <div className="landing-body" onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <button
            className="close-button"
            onClick={closeAbout}
            aria-label="Close about information"
          >
            <Icon name="close" className="feature-icon" />
          </button>

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
            To me, a website is more than code or visuals, it should tell your
            brand's story and turn visitors into believers in what you do.
          </div>

          <div className="features">
            <div className="feature-wrapper">
              <div className="feature">
                <Icon name="experience" className="feature-icon" />

                <p className="feature-text">
                  With hands-on experience at leading tech companies and M.Sc.
                  in Information Systems, I turn complex ideas into functional
                  realities through <strong>clean code</strong>,
                  <strong> thoughtful design</strong>, and
                  <strong> true collaboration</strong>.
                </p>
              </div>
              <div className="separator-line"></div>
            </div>

            <div className="feature-wrapper">
              <div className="feature">
                <Icon name="balance" className="feature-icon" />

                <p className="feature-text">
                  Each project is a dialogue: balancing
                  <strong> what inspires you </strong> with
                  <strong> what serves your audience</strong>,
                  <strong> creativity</strong> with
                  <strong> strategy</strong>, <strong> vision</strong> with
                  <strong> impact</strong>.
                </p>
              </div>
              <div className="separator-line"></div>
            </div>
          </div>

          <div className="cta">
            Let's create together something that makes you unique
            <br />
            and helps your business grow
          </div>

          <div className="contact-buttons">
            <ContactButtons links={linksConfig} />
          </div>
        </div>
      </div>
    </Html>
  );
}
