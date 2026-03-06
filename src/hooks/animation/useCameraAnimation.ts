import { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { CAMERA_ANIMATION_PRESETS } from "../../config/3d";

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
 * Custom hook for animating camera position with GSAP
 * Handles both single animations and sequences
 */
export default function useCameraAnimation(controlsRef: React.RefObject<any>) {
  const { camera } = useThree();
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(
    null
  );

  /**
   * Get camera position relative to target from screen perspective
   */
  const getCameraRelativePosition = useCallback(
    (
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
    },
    [camera]
  );

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

      animationRef.current = gsap.timeline({
        onComplete: () => {
          controls.enabled = true;
          if (onComplete) onComplete();
        },
      });

      animationRef.current.to(animationProgress, {
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
      });

      return animationRef.current;
    },
    [camera, controlsRef]
  );

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
    getCameraRelativePosition,
  };
}
