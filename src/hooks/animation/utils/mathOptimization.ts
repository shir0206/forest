import * as THREE from "three";

/**
 * Cached mathematical constants for performance
 */
export const MATH_CONSTANTS = {
  PI: Math.PI,
  PI_2: Math.PI * 2,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
} as const;

/**
 * Optimized distance calculation without creating temporary vectors
 */
export const fastDistance = (v1: THREE.Vector3, v2: THREE.Vector3): number => {
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  const dz = v1.z - v2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Optimized vector subtraction and normalization
 */
export const fastSubtractAndNormalize = (
  target: THREE.Vector3,
  source: THREE.Vector3,
  result: THREE.Vector3
): THREE.Vector3 => {
  result.x = target.x - source.x;
  result.y = target.y - source.y;
  result.z = target.z - source.z;
  return result.normalize();
};

/**
 * Optimized dot product calculation
 */
export const fastDot = (v1: THREE.Vector3, v2: THREE.Vector3): number => {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

/**
 * Optimized cross product calculation
 */
export const fastCross = (
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  result: THREE.Vector3
): THREE.Vector3 => {
  const x = v1.y * v2.z - v1.z * v2.y;
  const y = v1.z * v2.x - v1.x * v2.z;
  const z = v1.x * v2.y - v1.y * v2.x;
  result.set(x, y, z);
  return result;
};

/**
 * Optimized vector length calculation
 */
export const fastLength = (v: THREE.Vector3): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
};
