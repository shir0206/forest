import React, { useState, useCallback, useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./browser.scss";
import { Icon } from "@/components/icon/Icon";
import { WINDOW_STATE, WindowState } from "@/helper/types";
import { useHtmlReady } from "@/hooks/useHtmlReady";
import { useScreenVisibility } from "@/hooks/useScreenVisibility";
import { SCREENS } from "@/helper/const";
import WebsiteSection from "@/components/websiteScreen/WebsiteScreen";

type BrowserProps = {
  position: [number, number, number];
  closeAbout: (e: React.MouseEvent) => void;
};

// Scroll indicator component
const ScrollIndicator = () => (
  <div className="scroll-indicator">
    <div className="scroll-arrow" />
  </div>
);

export default function Browser({ position, closeAbout }: BrowserProps) {
  const [windowState, setWindowState] = useState<WindowState>(
    WINDOW_STATE.DEFAULT
  );

  const { ref: contentRef, ready } = useHtmlReady<HTMLDivElement>();
  const { visibleScreens, clearVisible, setScreenRef } = useScreenVisibility(
    contentRef,
    ready
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      clearVisible();
      setWindowState(WINDOW_STATE.CLOSED);
      closeAbout(e);
    },
    [clearVisible, closeAbout]
  );

  const handleMinimize = useCallback(() => {
    setWindowState((prev) =>
      prev === WINDOW_STATE.MINIMIZED
        ? WINDOW_STATE.DEFAULT
        : WINDOW_STATE.MINIMIZED
    );
  }, []);

  const handleMaximize = useCallback(() => {
    setWindowState((prev) =>
      prev === WINDOW_STATE.MAXIMIZED
        ? WINDOW_STATE.DEFAULT
        : WINDOW_STATE.MAXIMIZED
    );
  }, []);

  const vector3Position = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  return (
    <Html
      position={vector3Position}
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
          {SCREENS.map(({ id, Screen }) => (
            <WebsiteSection
              key={id}
              id={id}
              isVisible={visibleScreens.has(id)}
              Screen={Screen}
              setRef={setScreenRef(id)}
            />
          ))}
        </div>
      </div>
    </Html>
  );
}
