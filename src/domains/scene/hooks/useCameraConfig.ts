import { SCENE_CONFIG } from "../config/scene";

/**
 * Gets camera aspect ratio based on current window dimensions
 * @returns Camera aspect ratio
 */
export function getCameraAspect(): number {
  if (typeof window === "undefined") return 1;
  return window.innerWidth / window.innerHeight;
}

/**
 * Returns camera configuration for the 3D scene
 * @returns Camera configuration object with position, FOV, and aspect ratio
 */
export function useCameraConfig() {
  return {
    position: SCENE_CONFIG.initCameraPos,
    fov: SCENE_CONFIG.cameraFov,
    aspect: getCameraAspect(),
  };
}
