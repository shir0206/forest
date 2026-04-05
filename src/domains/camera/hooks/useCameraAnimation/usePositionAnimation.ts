import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";

import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

import { CAMERA_ANIMATION_PRESETS } from "../../config/presets";
import { CameraAnimationConfig } from "./types";

/**
 * Hook for animating camera to a single position with parabolic motion
 *
 * This hook handles the animation logic for moving the camera to a specific
 * target position using a parabolic arc trajectory. It's designed to be used
 * by the main useCameraAnimation hook.
 */
export const usePositionAnimation = (
  controlsRef: React.RefObject<OrbitControls | null>
) => {
  const { camera } = useThree();
  const animationRef = useRef<gsap.core.Tween | null>(null);

  /**
   * Animate camera to a single position with parabolic motion.
   * Unchanged — used by Butterfly.
   */
  const animateToPosition = useCallback(
    ({
      targetPosition,
      duration = 2,
      ease = "power2.inOut",
      onStart,
      onComplete,
      lookAt = [0, 0, 0],
      arcHeight = -CAMERA_ANIMATION_PRESETS.smoothArc.arcHeight,
    }: CameraAnimationConfig) => {
      const controls = controlsRef.current;
      if (!controls) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      controls.enabled = false;

      if (onStart) onStart();

      const target =
        targetPosition instanceof THREE.Vector3
          ? targetPosition
          : new THREE.Vector3(...targetPosition);

      const lookAtTarget =
        lookAt instanceof THREE.Vector3 ? lookAt : new THREE.Vector3(...lookAt);

      const startPosition = camera.position.clone();

      const midpoint = new THREE.Vector3()
        .addVectors(startPosition, target)
        .multiplyScalar(0.5);

      const distance = startPosition.distanceTo(target);
      const arcHeightValue = distance * arcHeight;

      const controlPoint = midpoint.clone();
      controlPoint.y += arcHeightValue;

      const animationProgress = { t: 0 };

      animationRef.current = gsap.to(animationProgress, {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
          const t = animationProgress.t;

          const oneMinusT = 1 - t;
          const oneMinusTSquared = oneMinusT * oneMinusT;
          const tSquared = t * t;
          const twoOneMinusTTimesT = 2 * oneMinusT * t;

          camera.position.x =
            oneMinusTSquared * startPosition.x +
            twoOneMinusTTimesT * controlPoint.x +
            tSquared * target.x;

          camera.position.y =
            oneMinusTSquared * startPosition.y +
            twoOneMinusTTimesT * controlPoint.y +
            tSquared * target.y;

          camera.position.z =
            oneMinusTSquared * startPosition.z +
            twoOneMinusTTimesT * controlPoint.z +
            tSquared * target.z;

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
   * Cancel any ongoing position animation
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
    animateToPosition,
    cancelAnimation,
  };
};
