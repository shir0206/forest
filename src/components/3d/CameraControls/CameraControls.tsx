"use client";
import { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";

import { SCENE_ANIMATION_POSITIONS } from "../../../config/3d";
import { WINDOW_STATE } from "../../../domains/browser/types";
import useCameraAnimation from "../../../hooks/animation/useCameraAnimation";
import useDynamicFov from "../../../hooks/animation/useDynamicFov";
import { useAppContext } from "../../../shared/contexts/AppContext";

type CameraControlsProps = {
  controlsRef: React.RefObject<React.ComponentRef<typeof OrbitControls> | null>;
};

export default function CameraControls({ controlsRef }: CameraControlsProps) {
  const { windowState, runIntro, setRunIntro } = useAppContext();

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
      enabled={windowState === WINDOW_STATE.CLOSED}
      enableRotate={windowState === WINDOW_STATE.CLOSED}
      enableZoom={windowState === WINDOW_STATE.CLOSED}
      enablePan={windowState === WINDOW_STATE.CLOSED}
    />
  );
}
