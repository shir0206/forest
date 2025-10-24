"use client";
import React, { useRef, useEffect, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useProgress,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>;
}

function useDynamicFov(controlsRef) {
  const { camera } = useThree();
  const [lastDistance, setLastDistance] = useState(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const updateFov = () => {
      const distance = controls.getDistance();
      if (lastDistance === null) {
        setLastDistance(distance);
        return;
      }

      const delta = distance - lastDistance;

      // 🔹 שינוי עדין יותר כדי לא ליצור fish-eye
      // ככל שמתקרבים — FOV יורד מעט, אבל לא נפתח יותר מדי כשמתרחקים
      let newFov = camera.fov + delta * 1.2; // במקום *2
      newFov = THREE.MathUtils.clamp(newFov, 45, 85); // גבולות ריאליים ונעימים

      camera.fov = newFov;
      camera.updateProjectionMatrix();

      setLastDistance(distance);
    };

    controls.addEventListener("change", updateFov);
    return () => controls.removeEventListener("change", updateFov);
  }, [camera, controlsRef, lastDistance]);
}

function CameraControls() {
  const controls = useRef();
  const { camera, gl } = useThree();

  useDynamicFov(controls); // 🔹 מפעילים את ההוק

  useEffect(() => {
    const c = controls.current;

    const handleStart = () => console.log("🎮 Interaction start");
    const handleChange = () => console.log("↻ Camera changed (drag or zoom)");
    const handleEnd = () => console.log("✅ Interaction end");

    c.addEventListener("start", handleStart);
    c.addEventListener("change", handleChange);
    c.addEventListener("end", handleEnd);

    return () => {
      c.removeEventListener("start", handleStart);
      c.removeEventListener("change", handleChange);
      c.removeEventListener("end", handleEnd);
    };
  }, []);

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableZoom={true}
      enablePan={true}
      zoomSpeed={0.6}
      rotateSpeed={0.8}
      minDistance={1}
      maxDistance={20}
    />
  );
}

export default function ForestScene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: [0, 0, 5],
          fov: 60,
          aspect: window.innerWidth / window.innerHeight,
        }}
      >
        <Suspense fallback={<Loader />}>
          <Environment
            files="./hdri/landscape_upscayl_4x_high-fidelity-4x.exr"
            background={true}
          />
          <CameraControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
