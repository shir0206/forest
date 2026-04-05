import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";

import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

import { CameraAnimationSequenceConfig } from "./types";

/**
 * Hook for animating camera through a sequence of positions using a CatmullRom spline
 *
 * This hook handles the animation logic for moving the camera through a sequence
 * of positions using a smooth CatmullRom spline curve. It's designed to be used
 * by the main useCameraAnimation hook.
 */
export const useSequenceAnimation = (
  controlsRef: React.RefObject<OrbitControls | null>
) => {
  const { camera } = useThree();
  const animationRef = useRef<gsap.core.Tween | null>(null);

  /**
   * Animate camera through a sequence of positions using a CatmullRom spline.
   *
   * Instead of animating point-to-point (which causes stop-start at each waypoint),
   * we build a smooth curve through ALL positions and drive a single parametric t
   * from 0 → 1 along it. The ease applies once to the whole journey, so the camera
   * accelerates once and decelerates once — no stuttering between waypoints.
   *
   * @param duration - Total seconds for the entire path (not per-segment).
   * @param tension  - CatmullRom tension: 0 = loose/swoopy, 1 = tight. Default: 0.5
   */
  const animateSequence = useCallback(
    ({
      positions,
      duration = 8,
      ease = "power2.inOut",
      onStart,
      onComplete,
      lookAt = [0, 0, 0],
      tension = 0.5,
    }: CameraAnimationSequenceConfig) => {
      const controls = controlsRef.current;
      if (!controls || positions.length < 2) return;

      // Kill any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill();
      }

      controls.enabled = false;

      if (onStart) onStart();

      const lookAtTarget =
        lookAt instanceof THREE.Vector3 ? lookAt : new THREE.Vector3(...lookAt);

      // Convert all positions to Vector3
      const points = positions.map((pos) =>
        pos instanceof THREE.Vector3 ? pos.clone() : new THREE.Vector3(...pos)
      );

      // Build a smooth CatmullRom spline through every waypoint.
      // Unlike per-segment tweens, the curve passes smoothly through all points
      // with continuous tangents — no hard corners, no velocity reset between steps.
      const curve = new THREE.CatmullRomCurve3(
        points,
        false, // not a closed loop
        "catmullrom",
        tension
      );

      // Single parametric driver: t goes 0 → 1 along the entire curve
      const progress = { t: 0 };

      // Use a Tween (not a Timeline) — one animation, one ease, whole journey
      animationRef.current = gsap.to(progress, {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
          const point = curve.getPoint(progress.t);
          camera.position.copy(point);
          camera.lookAt(lookAtTarget);
          if (controls.enabled) {
            controls.update();
          }
        },
        onComplete: () => {
          controls.enabled = true;
          if (onComplete) onComplete();
        },
      });

      return animationRef.current;
    },
    [camera, controlsRef]
  );

  /**
   * Cancel any ongoing sequence animation
   */
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
  }, [controlsRef]);

  return {
    animateSequence,
    cancelAnimation,
  };
};
