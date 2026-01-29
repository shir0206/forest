import { PositionThreeD } from "../types/3d";

// 3D Scene Configuration
export const SCENE_CONFIG = {
  backgroundFile: "hdri/Gemini_Generated_Image_c4rtmic4rtmic4rt.exr",
  initCameraPos: [-0.0069, -0.9996, -0.0255] as PositionThreeD,
  butterflyPos: [-0.42, -0.1635, -0.4365] as PositionThreeD,
  animationDuration: 2000,
  cameraTransitionDuration: 1500,
} as const;

// Camera animation positions for the scene tour
export const SCENE_ANIMATION_POSITIONS: PositionThreeD[] = [
  [-0.0069, -0.9996, -0.0255],
  [-0.0386, -0.9987, -0.0331],
  [-0.7787, -0.056, -0.6249],
  [-0.5161, 0.1915, 0.8348],
  [0.59, 0.15, 0.7885],
  [0.6, 0.24, 0.6234],
] as const;

// Camera configuration
export const CAMERA_CONFIG = {
  near: 0.1,
  far: 100,
  fov: 45,
  aspect: 1,
  position: SCENE_CONFIG.initCameraPos,
} as const;

// Animation timing
export const ANIMATION_TIMING = {
  introDuration: 3000,
  screenTransition: 500,
  cameraMove: 1000,
} as const;
