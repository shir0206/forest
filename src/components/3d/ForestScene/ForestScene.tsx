"use client";
import React, { Suspense, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Butterfly from "../../ui/Butterfly/Butterfly.tsx";
import CameraControls from "../CameraControls/CameraControls.tsx";
import CinematicEffects from "../CinematicEffects/CinematicEffects.tsx";
import Loader from "../../../shared/components/Loader/Loader.tsx";
import {
  SCENE_CONFIG,
  DEVICE_CONFIG,
  SCENE_ANIMATION_POSITIONS,
} from "../../../config/3d";
import Browser from "../../ui/Browser/Browser.tsx";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { WINDOW_STATE, DeviceType } from "../../../types/app";
import Background from "./Background.tsx";
import DecorativeButterflies from "./Decorativebutterflies.tsx";

/**
 * Handles canvas click events to close the browser window
 */
const createCanvasClickHandler = (
  windowState: (typeof WINDOW_STATE)[keyof typeof WINDOW_STATE],
  setWindowState: (
    state: (typeof WINDOW_STATE)[keyof typeof WINDOW_STATE]
  ) => void
) => {
  return (event: React.MouseEvent) => {
    event.stopPropagation();
    if (windowState !== WINDOW_STATE.CLOSED) {
      setWindowState(WINDOW_STATE.CLOSED);
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
  const controlsRef = useRef(null);

  // Handle case where context is undefined
  if (!appContext) {
    console.error("ForestScene: AppContext not found");
    return null;
  }

  const { runIntro, windowState, setWindowState, device } = appContext;

  const handleCanvasClick = useCallback(
    createCanvasClickHandler(windowState, setWindowState),
    [windowState, setWindowState]
  );

  // Get butterfly count based on device type
  const butterflyCount = DEVICE_CONFIG.butterflyCount[device as DeviceType];

  return (
    <div className="w-full h-openInfoscreen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh", filter: "blur(0px)" }}
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
          <CinematicEffects isAboutOpen={windowState !== "closed"} />
          {runIntro && (
            <DecorativeButterflies
              count={butterflyCount}
              flyAwayAfterMs={6500}
              cameraPositions={SCENE_ANIMATION_POSITIONS}
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
