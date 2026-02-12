import { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { CAMERA_ANIMATION_PRESETS } from "../config/3d";
export type CameraAnimationConfig = {
  targetPosition: THREE.Vector3 | [number, number, number];
  duration?: number;
  ease?: string;
  onStart?: () => void;
  onComplete?: () => void;
  lookAt?: THREE.Vector3 | [number, number, number];
  /**
   * Height of the parabolic arc as a percentage of the distance (0-1)
   * Default: 0.3 (30% of distance)
   * Set to 0 for straight line motion
   */
  arcHeight?: number;
};

export type CameraAnimationSequenceConfig = {
  positions: (THREE.Vector3 | [number, number, number])[];
  duration?: number;
  ease?: string;
  onStart?: () => void;
  onComplete?: () => void;
  lookAt?: THREE.Vector3 | [number, number, number];
};

/**
 * Custom hook for animating camera position with GSAP
 * Handles both single animations and sequences
 */
export default function useCameraAnimation(controlsRef: React.RefObject<any>) {
  const { camera } = useThree();
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  /**
   * Animate camera to a single position with parabolic motion
   */
  const animateToPosition = useCallback(
    ({
      targetPosition,
      duration = 2,
      ease = "power2.inOut",
      onStart,
      onComplete,
      lookAt = [0, 0, 0],
      arcHeight = -CAMERA_ANIMATION_PRESETS.smoothArc.arcHeight, // Default arc height from preset
    }: CameraAnimationConfig) => {
      const controls = controlsRef.current;
      if (!controls) return;

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Disable controls during animation
      controls.enabled = false;

      if (onStart) onStart();

      const target =
        targetPosition instanceof THREE.Vector3
          ? targetPosition
          : new THREE.Vector3(...targetPosition);

      const lookAtTarget =
        lookAt instanceof THREE.Vector3 ? lookAt : new THREE.Vector3(...lookAt);

      // Store initial position
      const startPosition = camera.position.clone();

      // Calculate control point for parabolic curve
      // The control point is placed above the midpoint to create an arc
      const midpoint = new THREE.Vector3()
        .addVectors(startPosition, target)
        .multiplyScalar(0.5);

      // Calculate height of the arc based on distance
      const distance = startPosition.distanceTo(target);
      const arcHeightValue = distance * arcHeight;

      // Create control point above the midpoint
      const controlPoint = midpoint.clone();
      controlPoint.y += arcHeightValue;

      // Create animation object to track progress
      const animationProgress = { t: 0 };

      animationRef.current = gsap.timeline({
        onComplete: () => {
          controls.enabled = true;
          if (onComplete) onComplete();
        },
      });

      // Animate the progress parameter from 0 to 1
      animationRef.current.to(animationProgress, {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
          const t = animationProgress.t;

          // Quadratic Bezier curve formula
          // B(t) = (1-t)² * P0 + 2(1-t)t * P1 + t² * P2
          // where P0 = start, P1 = control point, P2 = end
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
          camera.updateProjectionMatrix();
          controls.update();
        },
      });

      return animationRef.current;
    },
    [camera, controlsRef]
  );

  /**
   * Animate camera through a sequence of positions
   */
  const animateSequence = useCallback(
    ({
      positions,
      duration = 3,
      ease = "power1.inOut",
      onStart,
      onComplete,
      lookAt = [0, 0, 0],
    }: CameraAnimationSequenceConfig) => {
      const controls = controlsRef.current;
      if (!controls) return;

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Disable controls during animation
      controls.enabled = false;

      if (onStart) onStart();

      const lookAtTarget =
        lookAt instanceof THREE.Vector3 ? lookAt : new THREE.Vector3(...lookAt);

      animationRef.current = gsap.timeline({
        onComplete: () => {
          controls.enabled = true;
          if (onComplete) onComplete();
          console.log("🎬 Animation sequence finished — user control restored");
        },
      });

      // Convert positions to Vector3 if needed
      const targetPoints = positions.map((pos) =>
        pos instanceof THREE.Vector3 ? pos : new THREE.Vector3(...pos)
      );

      // Add each position to the timeline
      targetPoints.forEach((targetPoint) => {
        animationRef.current!.to(camera.position, {
          x: targetPoint.x,
          y: targetPoint.y,
          z: targetPoint.z,
          duration,
          ease,
          onUpdate: () => {
            camera.lookAt(lookAtTarget);
            camera.updateProjectionMatrix();
            controls.update();
          },
        });
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
    animateSequence,
    cancelAnimation,
  };
}
