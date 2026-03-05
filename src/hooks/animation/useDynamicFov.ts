import { useEffect, useRef, useCallback, useMemo, RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "three-stdlib";
import * as THREE from "three";
import { throttleRAF } from "./utils/throttle";

export default function useDynamicFov(controlsRef: RefObject<OrbitControls>) {
  const { camera } = useThree();
  const lastDistanceRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Use throttled update instead of state
  const updateFov = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const distance = controls.getDistance();
    if (lastDistanceRef.current === null) {
      lastDistanceRef.current = distance;
      return;
    }

    const delta = distance - lastDistanceRef.current;
    // Change the FOV according to the change in zoom
    let newFov = (camera as THREE.PerspectiveCamera).fov + delta * 1.2;
    newFov = THREE.MathUtils.clamp(newFov, 10, 100);

    (camera as THREE.PerspectiveCamera).fov = newFov;
    camera.updateProjectionMatrix();
    lastDistanceRef.current = distance;
  }, [camera, controlsRef]);

  // Throttle updates to 60fps maximum
  const throttledUpdate = useMemo(() => throttleRAF(updateFov), [updateFov]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleZoom = () => {
      if (rafRef.current) return; // Prevent multiple RAF calls

      rafRef.current = requestAnimationFrame(() => {
        throttledUpdate();
        rafRef.current = null;
      });
    };

    controls.addEventListener("change", handleZoom);
    return () => {
      controls.removeEventListener("change", handleZoom);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [controlsRef, throttledUpdate]);
}
