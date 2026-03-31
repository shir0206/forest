"use client";
import React, { Suspense, useCallback, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import Browser from "../../../browser/components/Browser/Browser.tsx";
import { BROWSER_MODE, BrowserModeType } from "../../../browser/types";
import Butterfly from "../../../butterfly/components/ButterflyUI/Butterfly.tsx";
import DecorativeButterflies from "../../../butterfly/components/DecorativeButterflies";
import CameraControls from "../../../camera/components/CameraControls/CameraControls.tsx";
import { SCENE_ANIMATION_POSITIONS } from "../../../camera/config/presets";
import { useAppContext } from "../../../context";
import { DEVICE_CONFIG } from "../../../device/config";
import { SCENE_CONFIG } from "../../config/scene";
import Background from "../Background/Background.tsx";
import CinematicEffects from "../CinematicEffects/CinematicEffects.tsx";
import Loader from "../Loader";

/**
 * Handles canvas click events to close the browser window
 */
const createCanvasClickHandler = (
  browserMode: BrowserModeType,
  setBrowserMode: (state: BrowserModeType) => void
) => {
  return (event: React.MouseEvent) => {
    event.stopPropagation();
    if (browserMode !== BROWSER_MODE.CLOSED) {
      setBrowserMode(BROWSER_MODE.CLOSED);
    }
  };
};

/**
 * Gets camera aspect ratio based on current window dimensions
 */
const getCameraAspect = (): number => {
  if (typeof window === "undefined") return 1;
  return window.innerWidth / window.innerHeight;
};

/**
 * Main 3D Forest Scene component
 */
export default function ForestScene() {
  const appContext = useAppContext();

  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls> | null>(
    null
  );

  // Handle case where context is undefined
  if (!appContext) {
    console.error("ForestScene: AppContext not found");
    return null;
  }

  const { runIntro, browserMode, setBrowserMode, device } = appContext;

  const handleCanvasClick = useCallback(
    createCanvasClickHandler(browserMode, setBrowserMode),
    [browserMode, setBrowserMode]
  );

  // Get butterfly count based on device type
  const butterflyCount = DEVICE_CONFIG.butterflyCount[device];

  return (
    <div className="w-full h-openInfoscreen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: SCENE_CONFIG.initCameraPos,
          fov: SCENE_CONFIG.cameraFov,
          aspect: getCameraAspect(),
        }}
        onClick={handleCanvasClick}
      >
        <Suspense fallback={<Loader />}>
          <Background />
          <CameraControls controlsRef={controlsRef} />
          <CinematicEffects isAboutOpen={browserMode !== BROWSER_MODE.CLOSED} />
          {runIntro && (
            <DecorativeButterflies
              count={butterflyCount}
              flyAwayAfterMs={6500}
              cameraPositions={SCENE_ANIMATION_POSITIONS}
              spawnAnchor={[0.2, 0.2, 0.2]}
              cameraFov={SCENE_CONFIG.cameraFov}
              cameraTransitionDurationMs={SCENE_CONFIG.cameraTransitionDuration}
              leadSteps={2}
            />
          )}
          <Butterfly controlsRef={controlsRef} />

          <Browser />
        </Suspense>
      </Canvas>
    </div>
  );
}
