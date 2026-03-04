"use client";
import React, { Suspense, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Butterfly from "../../ui/Butterfly/Butterfly.tsx";
import CameraControls from "../CameraControls/CameraControls.tsx";
import CinematicEffects from "../CinematicEffects/CinematicEffects.tsx";
import Loader from "../../../shared/components/Loader/Loader.tsx";
import { SCENE_CONFIG } from "../../../config/3d";
import Browser from "../../ui/Browser/Browser.tsx";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { WINDOW_STATE } from "../../../types/app";
import Background from "./Background.tsx";
import DecorativeButterflies from "./Decorativebutterflies.tsx";

/**
 * Configuration interface for ForestScene component
 */
interface ForestSceneConfig {
  /** Initial camera position */
  cameraPosition: [number, number, number];
  /** Camera field of view */
  cameraFov: number;
  /** Butterfly position */
  butterflyPosition: [number, number, number];
  /** Click distance threshold for butterfly interaction */
  clickDistanceThreshold: number;
}

/**
 * Default configuration for ForestScene
 */
const DEFAULT_SCENE_CONFIG: ForestSceneConfig = {
  cameraPosition: SCENE_CONFIG.initCameraPos,
  cameraFov: 60,
  butterflyPosition: SCENE_CONFIG.butterflyPos,
  clickDistanceThreshold: 0.5,
};

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

  const { runIntro, windowState, setWindowState } = appContext;

  const handleCanvasClick = useCallback(
    createCanvasClickHandler(windowState, setWindowState),
    [windowState, setWindowState]
  );

  return (
    <div className="w-full h-openInfoscreen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh", filter: "blur(0px)" }}
        camera={{
          position: DEFAULT_SCENE_CONFIG.cameraPosition,
          fov: DEFAULT_SCENE_CONFIG.cameraFov,
          aspect: getCameraAspect(),
        }}
        onClick={handleCanvasClick}
      >
        <Suspense fallback={<Loader />}>
          <Background />
          <CameraControls controlsRef={controlsRef} />
          <CinematicEffects isAboutOpen={windowState !== "closed"} />
          {runIntro && (
            <DecorativeButterflies count={9} flyAwayAfterMs={6500} />
          )}
          <Butterfly
            position={DEFAULT_SCENE_CONFIG.butterflyPosition}
            controlsRef={controlsRef}
            clickDistanceThreshold={DEFAULT_SCENE_CONFIG.clickDistanceThreshold}
          />

          <Browser position={DEFAULT_SCENE_CONFIG.butterflyPosition} />
        </Suspense>
      </Canvas>
    </div>
  );
}
