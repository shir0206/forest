// Camera domain exports
export { getCameraRelativePosition } from "./hooks/cameraPositionAnalysis";
export { useCameraAnimation } from "./hooks/useCameraAnimation";
export { usePositionAnimation } from "./hooks/usePositionAnimation";
export { useSequenceAnimation } from "./hooks/useSequenceAnimation";

// Re-export types for convenience
export type { CameraRelativePosition } from "./hooks/cameraPositionAnalysis";
export type {
  CameraAnimationConfig,
  CameraAnimationSequenceConfig,
} from "./hooks/useCameraAnimation";

// Re-export presets and types
export {
  CAMERA_ANIMATION_PRESETS,
  SCENE_ANIMATION_POSITIONS,
} from "./config/presets";
export type {
  AnimationTiming,
  CameraConfig,
  MovingDirection,
  SceneConfig,
} from "./types/types";
