import { useCallback } from "react";
import { useThree } from "@react-three/fiber";

import { OrbitControls } from "three-stdlib";

import { createCameraRelativePositionCallback } from "./cameraPositionAnalysis";
import { CameraAnimationConfig, CameraAnimationSequenceConfig } from "./types";
import { usePositionAnimation } from "./usePositionAnimation";
import { useSequenceAnimation } from "./useSequenceAnimation";

/**
 * Main camera animation hook that combines position and sequence animation functionality
 *
 * This hook provides a unified interface for camera animations, combining the
 * functionality of position animation, sequence animation, and camera position analysis.
 * It maintains backward compatibility with the original useCameraAnimation hook.
 */
export default function useCameraAnimation(
  controlsRef: React.RefObject<OrbitControls | null>
) {
  const { camera } = useThree();

  // Use the extracted animation hooks
  const positionAnimation = usePositionAnimation(controlsRef);
  const sequenceAnimation = useSequenceAnimation(controlsRef);

  // Create the camera position analysis callback
  const getCameraRelativePosition =
    createCameraRelativePositionCallback(camera);

  /**
   * Animate camera to a single position with parabolic motion.
   *
   * This method delegates to the usePositionAnimation hook for the actual animation logic.
   */
  const animateToPosition = useCallback(
    (config: CameraAnimationConfig) => {
      return positionAnimation.animateToPosition(config);
    },
    [positionAnimation]
  );

  /**
   * Animate camera through a sequence of positions using a CatmullRom spline.
   *
   * This method delegates to the useSequenceAnimation hook for the actual animation logic.
   */
  const animateSequence = useCallback(
    (config: CameraAnimationSequenceConfig) => {
      return sequenceAnimation.animateSequence(config);
    },
    [sequenceAnimation]
  );

  /**
   * Cancel any ongoing animation (position or sequence)
   *
   * This method cancels animations from both the position and sequence animation hooks.
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
