import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";

import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

import { CAMERA_ANIMATION_PRESETS } from "../config/presets";

export type CameraAnimationConfig = {
  targetPosition: THREE.Vector3 | [number, number, number];
  duration?: number;
  ease?: string;
  onStart?: () => void;
  onComplete?: () => void;
  lookAt?: THREE.Vector3 | [number, number, number];
  /**
   * Height of the parabolic arc as a percentage of the distance
   * - Positive values (0.1 to 1.0): Arc curves upward (∩)
   * - Negative values (-0.1 to -1.0): Arc curves downward (∪)
   * - Zero (0): Straight line (no arc)
   * Default: from preset (typically -0.3)
   */
  arcHeight?: number;
};

/**
 * Hook for animating camera to a single position with parabolic motion.
 * Handles the position animation logic independently.
 */
export function usePositionAnimation(
  controlsRef: React.RefObject<OrbitControls | null>
) {
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
   * Cancel any ongoing animation
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
}
