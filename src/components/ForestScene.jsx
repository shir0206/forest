"use client";
import React, { useRef, useEffect, Suspense, useState, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html, // ייבוא רכיב Html
  useProgress,
  TransformControls,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import Butterfly from "./butterfly/Butterfly";

// קומפוננטת טעינה
function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>;
}

// Hook לשינוי דינמי של שדה הראייה (FOV)
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
      // נשנה את ה-FOV בהתאם לשינוי מרחק הזום
      let newFov = camera.fov + delta * 1.2;
      newFov = THREE.MathUtils.clamp(newFov, 10, 100);

      camera.fov = newFov;
      camera.updateProjectionMatrix();

      setLastDistance(distance);
    };

    controls.addEventListener("change", updateFov);
    return () => controls.removeEventListener("change", updateFov);
  }, [camera, controlsRef, lastDistance]);
}

// קומפוננטת השליטה במצלמה
function CameraControls({ runIntro }) {
  const controls = useRef();
  const { camera, gl } = useThree();

  // שימוש ב-Hook לשינוי FOV
  useDynamicFov(controls);

  // לוג של מיקום המצלמה וה-FOV
  useEffect(() => {
    const c = controls.current;

    const handleChange = () => {
      console.log("📍 position:", camera.position.toArray());
      console.log("🎥 fov:", camera.fov.toFixed(2));
    };

    c.addEventListener("change", handleChange);
    return () => c.removeEventListener("change", handleChange);
  }, [camera]);

  // אנימציית המבוא (Intro) באמצעות GSAP
  useEffect(() => {
    if (!runIntro) return;
    const c = controls.current;
    c.enabled = false; // השבתת שליטת המשתמש במהלך האנימציה

    const points = [
      new THREE.Vector3(-0.0069, -0.9996, -0.0255),
      new THREE.Vector3(-0.0386, -0.9987, -0.0331),
      new THREE.Vector3(-0.7787, -0.056, -0.6249),
      new THREE.Vector3(-0.5161, 0.1915, 0.8348),
      new THREE.Vector3(0.593, 0.1627, 0.7885),
    ];

    const tl = gsap.timeline({
      onComplete: () => {
        c.enabled = true; // החזרת שליטת המשתמש
        console.log("🎬 Intro animation finished — user control restored");
      },
    });

    points.forEach((p) => {
      tl.to(camera.position, {
        x: p.x,
        y: p.y,
        z: p.z,
        duration: 3,
        ease: "power1.inOut",
        onUpdate: () => {
          // לוודא שהמצלמה ממשיכה להסתכל על מרכז הסצנה
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          c.update();
        },
      });
    });
  }, [runIntro]);

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

// קומפוננטת הסצנה הראשית
export default function ForestScene() {
  const [runIntro, setRunIntro] = useState(true);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: [-0.0069, -0.9996, -0.0255],
          fov: 60,
          aspect: window.innerWidth / window.innerHeight,
        }}
      >
        <Suspense fallback={<Loader />}>
          <Environment
            files="./hdri/Gemini_Generated_Image_oo7v4roo7v4roo7v_upscayl_2x_digital-art-4x.done2(5).exr"
            background={true}
          />
          <CameraControls runIntro={runIntro} />
          <Butterfly
            position={[
              -0.5727975959985635, 0.06083208113596738, -0.4365143508459205,
            ]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
