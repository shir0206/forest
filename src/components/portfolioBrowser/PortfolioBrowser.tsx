import React, { useState, useEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
// import "./portfolio-browser.scss";

// Types
interface WindowState {
  minimized: boolean;
  maximized: boolean;
  closed: boolean;
}

type PortfolioBrowserProps = {
  position: [number, number, number];
  closeAbout: (e: React.MouseEvent) => void;
};

// Components
const ScrollIndicator: React.FC = () => (
  <div className="scroll-indicator">
    <div className="scroll-arrow"></div>
  </div>
);

const Screen1: React.FC = () => (
  <div className="screen screen-1">
    <h1>Connected.</h1>
    <p>
      This is how I usually work
      <br />
      with product teams.
    </p>
    <ScrollIndicator />
  </div>
);

const Screen2: React.FC = () => (
  <div className="screen screen-2">
    <p>
      I help product teams ship web features when things need to move, but
      quality still matters.
    </p>
    <p style={{ marginTop: "40px" }}>
      I join existing teams, work like in-house, and focus on delivery.
    </p>
    <ScrollIndicator />
  </div>
);

const Screen3: React.FC = () => (
  <div className="screen screen-3">
    <h2>Teams usually reach out when:</h2>
    <ul>
      <li>A feature is blocked</li>
      <li>The team is overloaded</li>
      <li>UI requires clean, thoughtful execution</li>
      <li>There's no time for heavy onboarding</li>
    </ul>
    <ScrollIndicator />
  </div>
);

const Screen4: React.FC = () => (
  <div className="screen screen-4">
    <div className="two-column">
      <div className="column">
        <h3>What you get</h3>
        <ul>
          <li>Clean, maintainable code</li>
          <li>Fast onboarding</li>
          <li>Clear communication</li>
          <li>Product-aware decisions</li>
        </ul>
      </div>
      <div className="column">
        <h3>What you won't get</h3>
        <ul>
          <li>Over-engineering</li>
          <li>Noise</li>
          <li>Half-finished solutions</li>
        </ul>
      </div>
    </div>
    <ScrollIndicator />
  </div>
);

const Screen5: React.FC = () => (
  <div className="screen screen-5">
    <h2>
      <div className="profile-pic">SZ</div>
      I'm Shir Zabolotny.
    </h2>
    <p>
      Web developer with experience in tech companies and an M.Sc. in
      Information Systems.
    </p>
    <p style={{ marginTop: "32px" }}>
      I care about architecture, clarity, and building things teams can trust.
    </p>
    <ScrollIndicator />
  </div>
);

const Screen6: React.FC = () => (
  <div className="screen screen-6">
    <p>If this feels like a good fit:</p>
    <div className="contact-links">
      <a href="mailto:shir@email.com">shir@email.com</a>
      <a href="#" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
    </div>
  </div>
);

// Main Component
export default function PortfolioBrowser({
  position,
  closeAbout,
}: PortfolioBrowserProps) {
  const [windowState, setWindowState] = useState<WindowState>({
    minimized: false,
    maximized: false,
    closed: false,
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const screenRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const options = {
      root: contentRef.current,
      threshold: 0.3,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, options);

    screenRefs.current.forEach((screen) => {
      if (screen) observer.observe(screen);
    });

    // Make first screen visible immediately
    if (screenRefs.current[0]) {
      screenRefs.current[0].classList.add("visible");
    }

    return () => observer.disconnect();
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    setWindowState((prev) => ({ ...prev, closed: true }));
    // setTimeout(() => {
    //   setWindowState((prev) => ({ ...prev, closed: false }));
    // }, 2000);
    closeAbout(e);
  };

  const handleMinimize = () => {
    setWindowState((prev) => ({ ...prev, minimized: !prev.minimized }));
  };

  const handleMaximize = () => {
    setWindowState((prev) => ({ ...prev, maximized: !prev.maximized }));
  };

  const containerClasses = `browser-container ${
    windowState.minimized ? "minimized" : ""
  } ${windowState.maximized ? "maximized" : ""} ${
    windowState.closed ? "closed" : ""
  }`;

  return (
    <Html
      position={new THREE.Vector3(...position)}
      center
      wrapperClass="portfolio-wrapper"
      distanceFactor={2}
      scale={[0.005, 0.005, 0.005]}
    >
      <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
        <div className="browser-header">
          <div className="window-controls">
            <button
              className="control-btn close-btn"
              onClick={handleClose}
            ></button>
            <button
              className="control-btn minimize-btn"
              onClick={handleMinimize}
            ></button>
            <button
              className="control-btn maximize-btn"
              onClick={handleMaximize}
            ></button>
          </div>
          <div className="browser-title">shir.z / workspace</div>
        </div>

        <div className="browser-content" ref={contentRef}>
          <div
            ref={(el) => {
              screenRefs.current[0] = el;
            }}
          >
            <Screen1 />
          </div>
          <div
            ref={(el) => {
              screenRefs.current[1] = el;
            }}
          >
            <Screen2 />
          </div>
          <div
            ref={(el) => {
              screenRefs.current[2] = el;
            }}
          >
            <Screen3 />
          </div>
          <div
            ref={(el) => {
              screenRefs.current[3] = el;
            }}
          >
            <Screen4 />
          </div>
          <div
            ref={(el) => {
              screenRefs.current[4] = el;
            }}
          >
            <Screen5 />
          </div>
          <div
            ref={(el) => {
              screenRefs.current[5] = el;
            }}
          >
            <Screen6 />
          </div>
        </div>
      </div>
    </Html>
  );
}
