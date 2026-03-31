"use client";
import { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";

import { BROWSER_MODE } from "../../../browser/types";
import { useAppContext } from "../../../context";
import { SCENE_ANIMATION_POSITIONS } from "../../config/presets";
import { useCameraAnimation } from "../../hooks/useCameraAnimation";
import useDynamicFov from "../../hooks/useDynamicFov";

type CameraControlsProps = {
  controlsRef: React.RefObject<React.ComponentRef<typeof OrbitControls> | null>;
};

export default function CameraControls({ controlsRef }: CameraControlsProps) {
  const { browserMode, runIntro, setRunIntro } = useAppContext();

  useDynamicFov(controlsRef);
  const { animateSequence } = useCameraAnimation(controlsRef);

  useEffect(() => {
    if (!runIntro) return;

    animateSequence({
      positions: SCENE_ANIMATION_POSITIONS,
      duration: 10,
      ease: "power2.inOut",
      tension: 0.8,
      onComplete: () => {
        setRunIntro(false);
      },
    });
  }, [runIntro, animateSequence, setRunIntro]);

  return (
    <OrbitControls
      ref={controlsRef}
      zoomSpeed={0.6}
      rotateSpeed={0.8}
      minDistance={1}
      maxDistance={20}
      enabled={browserMode === BROWSER_MODE.CLOSED}
      enableRotate={browserMode === BROWSER_MODE.CLOSED}
      enableZoom={browserMode === BROWSER_MODE.CLOSED}
      enablePan={browserMode === BROWSER_MODE.CLOSED}
    />
  );
}
