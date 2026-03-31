import { useMemo } from "react";
import { Html } from "@react-three/drei";

import * as THREE from "three";

import "./browser.scss";

import { LANGUAGE } from "../../../../i18n/types";
import { useAppContext } from "../../../context";
import { ContextBridge } from "../../../context/bridge/ContextBridge.tsx";
import Navigation from "../../../navigation/components/Navigation/Navigation";
import { useSectionVisibility } from "../../../navigation/hooks/useScreenVisibility";
import { SCENE_CONFIG } from "../../../scene/config/scene";
import { SECTIONS } from "../../config/screens";
import { useHtmlReady } from "../../hooks/useHtmlReady";
import WebsiteSection from "../WebsiteSection/WebsiteSection.tsx";
import { BrowserHeader } from "./BrowserHeader";

export default function Browser() {
  const appContext = useAppContext();
  const position = SCENE_CONFIG.butterflyPos;

  if (!appContext) {
    console.error("Browser: AppContext not found");
  }

  const { browserMode, visibleSectionIds, language, runIntro } = appContext;

  const { ref: contentRef, ready } = useHtmlReady<HTMLDivElement>();
  const { setSectionRef } = useSectionVisibility(contentRef, ready);

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
                {SECTIONS.map(({ id, Screen }) => (
                  <WebsiteSection
                    key={id}
                    id={id}
                    isVisible={visibleSectionIds.has(id)}
                    Screen={{ id, title: id, component: Screen }}
                    setRef={setSectionRef(id)}
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
