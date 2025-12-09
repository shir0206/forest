"use client";
import React, { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Butterfly from "../butterfly/Butterfly";
import CameraControls from "../cameraControls/CameraControls";
import About from "../about/About";
import Loader from "../loader/Loader";
import { backgroundFile, butterflyPos, initCameraPos } from "@/helper/const";

export default function ForestScene() {
  const [runIntro, setRunIntro] = useState<boolean>(true);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  const openAbout = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAboutOpen(true);
    console.log("setIsAboutOpen(true)");
  }, []);

  const closeAbout = useCallback(
    (e: React.MouseEvent) => {
      if (isAboutOpen) {
        setIsAboutOpen(false);
        console.log("setIsAboutOpen(false)");
      }
    },
    [isAboutOpen]
  );

  return (
    <div className="w-full h-openInfoscreen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: initCameraPos,
          fov: 60,
          aspect:
            typeof window !== "undefined"
              ? window.innerWidth / window.innerHeight
              : 1,
        }}
        onClick={closeAbout}
      >
        <Suspense fallback={<Loader />}>
          <Environment files={backgroundFile} background={true} />

          <CameraControls runIntro={runIntro} />

          <Butterfly
            position={butterflyPos}
            openAbout={openAbout}
            isAboutOpen={isAboutOpen}
          />

          {isAboutOpen && (
            <About position={butterflyPos} closeAbout={closeAbout} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
