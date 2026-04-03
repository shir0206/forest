"use client";
import React, { Suspense, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import Browser from "../../../browser/components/Browser/Browser.tsx";
import { BROWSER_MODE } from "../../../browser/types";
import Butterfly from "../../../butterfly/components/ButterflyUI/Butterfly.tsx";
import DecorativeButterflies from "../../../butterfly/components/DecorativeButterflies";
import CameraControls from "../../../camera/components/CameraControls/CameraControls.tsx";
import { SCENE_ANIMATION_POSITIONS } from "../../../camera/config/presets";
import { useAppContext } from "../../../context";
import { SCENE_CONFIG } from "../../config/scene";
import { useCameraConfig } from "../../hooks/useCameraConfig";
import { useCanvasClickHandler } from "../../hooks/useCanvasClickHandler";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";
import Background from "../Background/Background.tsx";
import CinematicEffects from "../CinematicEffects/CinematicEffects.tsx";
import Loader from "../Loader";

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

  const { runIntro, browserMode, setBrowserMode } = appContext;

  // Use extracted hooks
  const handleCanvasClick = useCanvasClickHandler(browserMode, setBrowserMode);
  const cameraConfig = useCameraConfig();
  const { butterflyCount } = useDeviceDetection();

  return (
    <div className="w-full h-openInfoscreen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={cameraConfig}
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
