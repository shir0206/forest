import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./browser.scss";
import { useHtmlReady } from "../../../hooks/ui/useHtmlReady";
import { useScreenVisibility } from "../../../hooks/navigation/useScreenVisibility";
import { SCREENS } from "../../../config/app";
import WebsiteSection from "../WebsiteScreen/WebsiteScreen.tsx";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { ContextBridge } from "../../ContextBridge";
import { BrowserHeader } from "./BrowserHeader";
import Navigation from "../Navigation/Navigation";
import { LANGUAGE } from "../../../types/app.ts";

type BrowserProps = {
  position: [number, number, number];
};

export default function Browser({ position }: BrowserProps) {
  const appContext = useAppContext();

  if (!appContext) {
    console.error("Browser: AppContext not found");
  }

  const { windowState, visibleScreens, language } = appContext;
  // Extract the full context value to pass to the bridge
  const { ref: contentRef, ready } = useHtmlReady<HTMLDivElement>();
  const { setScreenRef } = useScreenVisibility(contentRef, ready);

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
      <ContextBridge contextValue={appContext}>
        <div
          className={`browser-container ${windowState}`}
          onClick={(e) => e.stopPropagation()}
        >
          <BrowserHeader />

          <div
            className={`browser-content${
              language == LANGUAGE.HE ? " rtl" : ""
            }`}
            ref={contentRef}
          >
            <Navigation containerRef={contentRef} />
            {SCREENS.map(({ id, Screen }) => (
              <WebsiteSection
                key={id}
                id={id}
                isVisible={visibleScreens.has(id)}
                Screen={Screen}
                setRef={setScreenRef(id)}
                containerRef={contentRef}
              />
            ))}
          </div>
        </div>
      </ContextBridge>
    </Html>
  );
}
