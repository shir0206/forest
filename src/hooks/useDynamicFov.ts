import { useEffect, useState, RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "three-stdlib";
import * as THREE from "three";

export default function useDynamicFov(controlsRef: RefObject<OrbitControls>) {
  const { camera } = useThree();
  const [lastDistance, setLastDistance] = useState<number | null>(null);

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
      // Change the FOV according to the change in zoom
      let newFov = (camera as THREE.PerspectiveCamera).fov + delta * 1.2;
      newFov = THREE.MathUtils.clamp(newFov, 10, 100);

      (camera as THREE.PerspectiveCamera).fov = newFov;
      camera.updateProjectionMatrix();

      setLastDistance(distance);
    };

    controls.addEventListener("change", updateFov);
    return () => controls.removeEventListener("change", updateFov);
  }, [camera, controlsRef, lastDistance]);
}
