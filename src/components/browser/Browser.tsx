import React, { useState, useRef, useCallback } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./browser.scss";
import { Icon } from "@/components/icon/Icon";
import { WINDOW_STATE, WindowState } from "@/helper/types";
import { useHtmlReady } from "@/hooks/useHtmlReady";
import HeroSection from "../heroSection/HeroSection";
import ExpertiseCards from "../expertiseCards/ExpertiseCards";
import AboutMe from "../AboutMe/AboutMe";

type BrowserProps = {
  position: [number, number, number];
  closeAbout: (e: React.MouseEvent) => void;
};

type ScreenConfig = {
  id: string;
  component: React.ComponentType<{ isVisible: boolean }>;
};

const ScrollIndicator = () => (
  <div className="scroll-indicator">
    <div className="scroll-arrow" />
  </div>
);

const Screen1 = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`screen screen-1 ${isVisible ? "visible" : ""}`}>
    <h1>Connected.</h1>
    <p>
      This is how I usually work
      <br />
      with product teams.
    </p>
    <ScrollIndicator />
  </div>
);

const Screen2 = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`screen screen-2 ${isVisible ? "visible" : ""}`}>
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

const Screen3 = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`screen screen-3 ${isVisible ? "visible" : ""}`}>
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

const Screen4 = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`screen screen-4 ${isVisible ? "visible" : ""}`}>
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

const Screen5 = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`screen screen-5 ${isVisible ? "visible" : ""}`}>
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

const Screen6 = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`screen screen-6 ${isVisible ? "visible" : ""}`}>
    <p>If this feels like a good fit:</p>
    <div className="contact-links">
      <a href="mailto:shir@email.com">shir@email.com</a>
      <a href="#" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
    </div>
  </div>
);

const SCREENS: ScreenConfig[] = [
  { id: "screen-1", component: HeroSection },
  { id: "screen-2", component: AboutMe },
  { id: "screen-3", component: ExpertiseCards },
];

export default function Browser({ position, closeAbout }: BrowserProps) {
  const [windowState, setWindowState] = useState<WindowState>(
    WINDOW_STATE.DEFAULT
  );

  const [visibleScreens, setVisibleScreens] = useState<Set<string>>(
    () => new Set(["screen-1"])
  );

  const screenRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { ref: contentRef, ready } = useHtmlReady<HTMLDivElement>();

  const markVisible = useCallback((id: string) => {
    setVisibleScreens((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  }, []);

  const clearVisible = useCallback(() => {
    setVisibleScreens(() => new Set());
  }, []);

  React.useEffect(() => {
    if (!ready || !contentRef.current) return;

    const container = contentRef.current;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();

      screenRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();

        const visibleHeight =
          Math.min(rect.bottom, containerRect.bottom) -
          Math.max(rect.top, containerRect.top);

        const ratio = visibleHeight / rect.height;

        if (ratio >= 0.3) {
          markVisible(id);
        }
      });
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [ready, markVisible]);

  const handleClose = (e: React.MouseEvent) => {
    clearVisible();
    setWindowState(WINDOW_STATE.CLOSED);
    closeAbout(e);
  };

  const handleMinimize = () => {
    setWindowState((prev) =>
      prev === WINDOW_STATE.MINIMIZED
        ? WINDOW_STATE.DEFAULT
        : WINDOW_STATE.MINIMIZED
    );
  };

  const handleMaximize = () => {
    setWindowState((prev) =>
      prev === WINDOW_STATE.MAXIMIZED
        ? WINDOW_STATE.DEFAULT
        : WINDOW_STATE.MAXIMIZED
    );
  };

  const setScreenRef = (id: string) => (el: HTMLDivElement | null) => {
    if (!el) {
      screenRefs.current.delete(id);
      return;
    }
    screenRefs.current.set(id, el);
  };

  return (
    <Html
      position={new THREE.Vector3(...position)}
      center
      wrapperClass="portfolio-wrapper"
      distanceFactor={2}
      scale={[0.005, 0.005, 0.005]}
    >
      <div
        className={`browser-container ${windowState}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="browser-header">
          <div className="window-controls">
            <button
              className="control-btn close-btn"
              onClick={handleClose}
              aria-label="Close window"
            >
              <Icon name="close" size={8} />
            </button>
            <button
              className="control-btn minimize-btn"
              onClick={handleMinimize}
              aria-label="Minimize window"
            >
              <Icon name="minimize" size={8} />
            </button>
            <button
              className="control-btn maximize-btn"
              onClick={handleMaximize}
              aria-label="Maximize window"
            >
              <Icon name="maximize" size={10} />
            </button>
          </div>

          <div className="browser-title">shir.z / workspace</div>
        </div>

        <div className="browser-content" ref={contentRef}>
          {SCREENS.map(({ id, component: Screen }) => (
            <div key={id} ref={setScreenRef(id)}>
              <Screen isVisible={visibleScreens.has(id)} />
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}
