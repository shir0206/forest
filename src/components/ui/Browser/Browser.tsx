import { useMemo } from "react";
import { Html } from "@react-three/drei";

import * as THREE from "three";

import "./browser.scss";

import { SCREENS } from "../../../domains/browser/config/screens";
import { useHtmlReady } from "../../../domains/browser/hooks/useHtmlReady";
import { useScreenVisibility } from "../../../domains/navigation/hooks/useScreenVisibility";
import { SCENE_CONFIG } from "../../../domains/scene/config/scene";
import { LANGUAGE } from "../../../i18n/types";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { ContextBridge } from "../../ContextBridge";
import Navigation from "../Navigation/Navigation";
import WebsiteSection from "../WebsiteScreen/WebsiteScreen.tsx";
import { BrowserHeader } from "./BrowserHeader";

export default function Browser() {
  const appContext = useAppContext();
  const position = SCENE_CONFIG.butterflyPos;

  if (!appContext) {
    console.error("Browser: AppContext not found");
  }

  const { browserMode, visibleScreenIds, language, runIntro } = appContext;

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
          className={`browser-container ${browserMode}`}
          onClick={(e) => e.stopPropagation()}
        >
          <BrowserHeader />

          <div
            className={`browser-content${
              language == LANGUAGE.HE ? " rtl" : ""
            }`}
            ref={contentRef}
          >
            {!runIntro && (
              <>
                <Navigation containerRef={contentRef} />
                {SCREENS.map(({ id, Screen }) => (
                  <WebsiteSection
                    key={id}
                    id={id}
                    isVisible={visibleScreenIds.has(id)}
                    Screen={Screen}
                    setRef={setScreenRef(id)}
                    containerRef={contentRef}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </ContextBridge>
    </Html>
  );
}
