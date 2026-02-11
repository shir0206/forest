"use client";
import React, { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Butterfly from "../../ui/Butterfly/Butterfly.tsx";
import CameraControls from "../CameraControls/CameraControls.tsx";
import CinematicEffects from "../CinematicEffects/CinematicEffects.tsx";
import Loader from "../../ui/Loader/Loader.tsx";
import { SCENE_CONFIG } from "../../../config/3d";
import Browser from "../../ui/Browser/Browser.tsx";
import { useAppContext } from "../../../contexts/AppContext";
import { WINDOW_STATE } from "../../../types/app";

export default function ForestScene() {
  //@ts-ignore
  const { runIntro, windowState, setWindowState } = useAppContext();

  const handleClose = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (windowState !== WINDOW_STATE.CLOSED) {
        setWindowState(WINDOW_STATE.CLOSED);
      }
    },
    [setWindowState]
  );

  return (
    <div className="w-full h-openInfoscreen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: SCENE_CONFIG.initCameraPos,
          fov: 60,
          aspect:
            typeof window !== "undefined"
              ? window.innerWidth / window.innerHeight
              : 1,
        }}
        onClick={handleClose}
      >
        <Suspense fallback={<Loader />}>
          <Environment files={SCENE_CONFIG.backgroundFile} background={true} />

          <CameraControls runIntro={runIntro} />
          <CinematicEffects isAboutOpen={windowState !== "closed"} />
          <Butterfly position={SCENE_CONFIG.butterflyPos} />

          {windowState !== WINDOW_STATE.CLOSED && (
            <Browser position={SCENE_CONFIG.butterflyPos}></Browser>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
