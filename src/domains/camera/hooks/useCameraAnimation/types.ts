import * as THREE from "three";

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
