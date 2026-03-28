import { useCallback } from "react";
import { useThree } from "@react-three/fiber";

import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

import { getCameraRelativePosition as getCameraRelativePositionUtil } from "./cameraPositionAnalysis";
import { usePositionAnimation } from "./usePositionAnimation";
import { useSequenceAnimation } from "./useSequenceAnimation";

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

export type CameraAnimationSequenceConfig = {
  positions: (THREE.Vector3 | [number, number, number])[];
  /**
   * Total duration for the entire path in seconds (not per-segment).
   * Default: 8
   */
  duration?: number;
  ease?: string;
  onStart?: () => void;
  onComplete?: () => void;
  lookAt?: THREE.Vector3 | [number, number, number];
  /**
   * CatmullRom curve tension (0 = loose/swoopy, 1 = tight/sharp).
   * Default: 0.5
   */
  tension?: number;
};

/**
 * Main camera animation hook that composes position and sequence animation logic.
 * Provides a unified interface for all camera animation needs.
 */
export function useCameraAnimation(
  controlsRef: React.RefObject<OrbitControls | null>
) {
  const { camera } = useThree();

  // Use the specialized sub-hooks
  const positionAnimation = usePositionAnimation(controlsRef);
  const sequenceAnimation = useSequenceAnimation(controlsRef);

  /**
   * Animate camera to a single position with parabolic motion.
   * Delegates to usePositionAnimation hook.
   */
  const animateToPosition = useCallback(
    (config: CameraAnimationConfig) => {
      return positionAnimation.animateToPosition(config);
    },
    [positionAnimation]
  );

  /**
   * Animate camera through a sequence of positions using a CatmullRom spline.
   * Delegates to useSequenceAnimation hook.
   */
  const animateSequence = useCallback(
    (config: CameraAnimationSequenceConfig) => {
      return sequenceAnimation.animateSequence(config);
    },
    [sequenceAnimation]
  );

  /**
   * Get camera position relative to target from screen perspective.
   * Delegates to cameraPositionAnalysis utility.
   */
  const getCameraRelativePosition = useCallback(
    (
      targetPosition: THREE.Vector3 | [number, number, number],
      lookAtPoint: THREE.Vector3 | [number, number, number] = [0, 0, 0]
    ) => {
      return getCameraRelativePositionUtil(camera, targetPosition, lookAtPoint);
    },
    [camera]
  );

  /**
   * Cancel any ongoing animation.
   * Cancels both position and sequence animations.
   */
  const cancelAnimation = useCallback(() => {
    positionAnimation.cancelAnimation();
    sequenceAnimation.cancelAnimation();
  }, [positionAnimation, sequenceAnimation]);

  return {
    animateToPosition,
    animateSequence,
    cancelAnimation,
    getCameraRelativePosition,
  };
}
