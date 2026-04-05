import { useCallback } from "react";

import * as THREE from "three";

/**
 * Camera relative position analysis utilities
 *
 * Provides functionality to analyze the camera's position relative to a target
 * from the screen's perspective, determining directional relationships and offsets.
 */
export interface CameraRelativePosition {
  /** Is camera to the left of target? */
  isLeft: boolean;
  /** Is camera to the right of target? */
  isRight: boolean;
  /** Is camera above target? */
  isAbove: boolean;
  /** Is camera below target? */
  isBelow: boolean;
  /** Is camera in front of target (closer to viewer)? */
  isInFront: boolean;
  /** Is camera behind target (further from viewer)? */
  isBehind: boolean;
  /** Horizontal offset (-1 to 1, negative = left, positive = right) */
  horizontalOffset: number;
  /** Vertical offset (-1 to 1, negative = below, positive = above) */
  verticalOffset: number;
  /** Depth offset (-1 to 1, negative = behind, positive = in front) */
  depthOffset: number;
  /** Overall distance from camera to target */
  distance: number;
}

/**
 * Get camera position relative to target from screen perspective
 *
 * @param camera - The Three.js camera instance
 * @param targetPosition - Target position to analyze relative to
 * @param lookAtPoint - Point the camera is looking at (defaults to origin)
 * @returns CameraRelativePosition object with directional analysis
 */
export const getCameraRelativePosition = (
  camera: THREE.Camera,
  targetPosition: THREE.Vector3 | [number, number, number],
  lookAtPoint: THREE.Vector3 | [number, number, number] = [0, 0, 0]
): CameraRelativePosition => {
  const target =
    targetPosition instanceof THREE.Vector3
      ? targetPosition
      : new THREE.Vector3(...targetPosition);

  const lookAt =
    lookAtPoint instanceof THREE.Vector3
      ? lookAtPoint
      : new THREE.Vector3(...lookAtPoint);

  const cameraPosition = camera.position;

  const cameraRight = new THREE.Vector3();
  const cameraUp = new THREE.Vector3();
  const cameraForward = new THREE.Vector3();

  cameraForward.subVectors(lookAt, cameraPosition).normalize();
  cameraUp.copy(camera.up).normalize();
  cameraRight.crossVectors(cameraForward, cameraUp).normalize();
  cameraUp.crossVectors(cameraRight, cameraForward).normalize();

  const toTarget = new THREE.Vector3().subVectors(target, cameraPosition);
  const distance = toTarget.length();

  const rightComponent = toTarget.dot(cameraRight);
  const upComponent = toTarget.dot(cameraUp);
  const forwardComponent = toTarget.dot(cameraForward);

  const horizontalOffset = rightComponent / distance;
  const verticalOffset = upComponent / distance;
  const depthOffset = forwardComponent / distance;

  return {
    isLeft: rightComponent < 0,
    isRight: rightComponent > 0,
    isAbove: upComponent > 0,
    isBelow: upComponent < 0,
    isInFront: forwardComponent > 0,
    isBehind: forwardComponent < 0,
    horizontalOffset,
    verticalOffset,
    depthOffset,
    distance,
  };
};

/**
 * Get camera position relative to target from screen perspective (callback version)
 *
 * @param camera - The Three.js camera instance
 * @returns A callback function that analyzes camera position relative to a target
 */
export const createCameraRelativePositionCallback = (camera: THREE.Camera) => {
  return useCallback(
    (
      targetPosition: THREE.Vector3 | [number, number, number],
      lookAtPoint: THREE.Vector3 | [number, number, number] = [0, 0, 0]
    ): CameraRelativePosition => {
      return getCameraRelativePosition(camera, targetPosition, lookAtPoint);
    },
    [camera]
  );
};
