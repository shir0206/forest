import React, { useCallback, useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./browser.scss";
import { Icon } from "../Icon/Icon";
import { WINDOW_STATE } from "../../../helper/types";
import { useHtmlReady } from "../../../hooks/useHtmlReady";
import { useScreenVisibility } from "../../../hooks/useScreenVisibility";
import { SCREENS } from "../../../helper/const";
import WebsiteSection from "../WebsiteScreen/WebsiteScreen.tsx";
import { useAppContext } from "../../../contexts/AppContext";

type BrowserProps = {
  position: [number, number, number];
};

// Scroll indicator component
const ScrollIndicator = () => (
  <div className="scroll-indicator">
    <div className="scroll-arrow" />
  </div>
);

export default function Browser({ position }: BrowserProps) {
  console.log("Rendering Browser component");
  const { windowState, setWindowState, visibleScreens, clearVisible } =
    useAppContext();

  const { ref: contentRef, ready } = useHtmlReady<HTMLDivElement>();
  const { setScreenRef } = useScreenVisibility(contentRef, ready);

  const handleClose = useCallback(
    (event: React.MouseEvent) => {
      clearVisible();
      setWindowState(WINDOW_STATE.CLOSED);
    },
    [clearVisible, setWindowState]
  );

  const handleMinimize = useCallback(() => {
    setWindowState(
      windowState === WINDOW_STATE.MINIMIZED
        ? WINDOW_STATE.OPEN
        : WINDOW_STATE.MINIMIZED
    );
  }, [setWindowState, windowState]);

  const handleMaximize = useCallback(() => {
    setWindowState(
      windowState === WINDOW_STATE.MAXIMIZED
        ? WINDOW_STATE.OPEN
        : WINDOW_STATE.MAXIMIZED
    );
  }, [setWindowState, windowState]);

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
              <Icon name="close" className="control-icon" size={8} />
            </button>
            <button
              className="control-btn minimize-btn"
              onClick={handleMinimize}
              aria-label="Minimize window"
            >
              <Icon name="minimize" className="control-icon" size={8} />
            </button>
            <button
              className="control-btn maximize-btn"
              onClick={handleMaximize}
              aria-label="Maximize window"
            >
              <Icon name="maximize" className="control-icon" size={10} />
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
