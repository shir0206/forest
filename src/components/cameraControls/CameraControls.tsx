"use client";
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import useDynamicFov from "../../hooks/useDynamicFov";
import { SCENE_ANIMATION_POSITIONS } from "../../config/3d";
import { useAppContext } from "../../contexts/AppContext";
import { WINDOW_STATE } from "../../types/app";

type CameraControlsProps = {
  runIntro: boolean;
};

export default function CameraControls({ runIntro }: CameraControlsProps) {
  const controlsRef = useRef<THREE.EventDispatcher | any>(null);
  const { camera, gl } = useThree();
  const { windowState } = useAppContext();

  // Hook responsible for dynamic FOV changes
  useDynamicFov(controlsRef);

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
    const controls = controlsRef.current;
    if (!controls) return;

    controls.enabled = false;

    const timeline = gsap.timeline({
      onComplete: () => {
        controls.enabled = true;
        console.log("🎬 Intro animation finished — user control restored");
      },
    });

    const sceneAnimationPoints = SCENE_ANIMATION_POSITIONS.map(
      ([x, y, z]: [number, number, number]) => new THREE.Vector3(x, y, z)
    );

    sceneAnimationPoints.forEach((targetPoint) => {
      timeline.to(camera.position, {
        x: targetPoint.x,
        y: targetPoint.y,
        z: targetPoint.z,
        duration: 3,
        ease: "power1.inOut",
        onUpdate: () => {
          // Ensure camera keeps looking at the scene center
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          controls.update();
        },
      });
    });
  }, [runIntro, camera]);

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
