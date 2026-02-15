"use client";
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import useDynamicFov from "../../../hooks/animation/useDynamicFov";
import useCameraAnimation from "../../../hooks/animation/useCameraAnimation";
import { SCENE_ANIMATION_POSITIONS } from "../../../config/3d";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { WINDOW_STATE } from "../../../types/app";

type CameraControlsProps = {
  runIntro: boolean;
  controlsRef: React.RefObject<any>;
};

export default function CameraControls({
  runIntro,
  controlsRef,
}: CameraControlsProps) {
  const { camera } = useThree();
  const { windowState } = useAppContext();

  // Custom hooks
  useDynamicFov(controlsRef);
  const { animateSequence } = useCameraAnimation(controlsRef);

  // Log camera position & FOV on change
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleChange = () => {
      console.log("📍 position:", camera.position.toArray());
      // @ts-ignore
      console.log("🎥 fov:", camera.fov.toFixed(2));
    };

    controls.addEventListener("change", handleChange);
    return () => controls.removeEventListener("change", handleChange);
  }, [camera]);

  // Intro animation
  useEffect(() => {
    if (!runIntro) return;

    animateSequence({
      positions: SCENE_ANIMATION_POSITIONS,
      duration: 3,
      ease: "power1.inOut",
    });
  }, [runIntro, animateSequence]);

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
