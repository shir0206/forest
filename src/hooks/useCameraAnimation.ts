import { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

export type CameraAnimationConfig = {
  targetPosition: THREE.Vector3 | [number, number, number];
  duration?: number;
  ease?: string;
  onStart?: () => void;
  onComplete?: () => void;
  lookAt?: THREE.Vector3 | [number, number, number];
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
   * Animate camera to a single position
   */
  const animateToPosition = useCallback(
    ({
      targetPosition,
      duration = 2,
      ease = "power2.inOut",
      onStart,
      onComplete,
      lookAt = [0, 0, 0],
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

      animationRef.current = gsap.timeline({
        onComplete: () => {
          controls.enabled = true;
          if (onComplete) onComplete();
        },
      });

      animationRef.current.to(camera.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration,
        ease,
        onUpdate: () => {
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
