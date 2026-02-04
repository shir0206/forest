import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./browser.scss";
import { useHtmlReady } from "../../../hooks/useHtmlReady";
import { useScreenVisibility } from "../../../hooks/useScreenVisibility";
import { SCREENS } from "../../../helper/const";
import WebsiteSection from "../WebsiteScreen/WebsiteScreen.tsx";
import { useAppContext } from "../../../contexts/AppContext";
import { ContextBridge } from "../../ContextBridge";
import { BrowserHeader } from "./BrowserHeader";

type BrowserProps = {
  position: [number, number, number];
};

export default function Browser({ position }: BrowserProps) {
  console.log("Rendering Browser component");
  const appContext = useAppContext();

  if (!appContext) {
    console.error("Browser: AppContext not found");
    return null;
  }

  const { windowState, visibleScreens } = appContext;

  const { ref: contentRef, ready } = useHtmlReady<HTMLDivElement>();
  const { setScreenRef } = useScreenVisibility(contentRef, ready);

  const vector3Position = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  return (
    <Html
      transform
      position={vector3Position}
      center
      wrapperClass="portfolio-wrapper"
      distanceFactor={2}
      scale={[0.005, 0.005, 0.005]}
    >
      <ContextBridge>
        <div
          className={`browser-container ${windowState}`}
          onClick={(e) => e.stopPropagation()}
        >
          <BrowserHeader />
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
      </ContextBridge>
    </Html>
  );
}
