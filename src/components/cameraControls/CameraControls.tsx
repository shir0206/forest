"use client";
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import useDynamicFov from "../../hooks/useDynamicFov";

type CameraControlsProps = {
  runIntro: boolean;
};

export default function CameraControls({ runIntro }: CameraControlsProps) {
  const controlsRef = useRef<THREE.EventDispatcher | any>(null);
  const { camera, gl } = useThree();

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

    const animationPoints = [
      new THREE.Vector3(-0.0069, -0.9996, -0.0255),
      new THREE.Vector3(-0.0386, -0.9987, -0.0331),
      new THREE.Vector3(-0.7787, -0.056, -0.6249),
      new THREE.Vector3(-0.5161, 0.1915, 0.8348),
      new THREE.Vector3(0.593, 0.1627, 0.7885),
      new THREE.Vector3(0.6, 0.3191, 0.62346),
    ];

    const timeline = gsap.timeline({
      onComplete: () => {
        controls.enabled = true;
        console.log("🎬 Intro animation finished — user control restored");
      },
    });

    animationPoints.forEach((targetPoint) => {
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
      enableZoom={true}
      enablePan={true}
      zoomSpeed={0.6}
      rotateSpeed={0.8}
      minDistance={1}
      maxDistance={20}
    />
  );
}
