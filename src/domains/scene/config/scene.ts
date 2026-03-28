import { PositionThreeD } from "../../../shared/types/primitives";
import { SCENE_ANIMATION_POSITIONS } from "../../camera/config/presets";

export const SCENE_CONFIG = {
  backgroundFile: "hdri/background.webp",
  initCameraPos: SCENE_ANIMATION_POSITIONS[0],
  butterflyPos: [-0.17, -0.08, -0.52] as PositionThreeD,
  animationDuration: 1000,
  cameraTransitionDuration: 1000,
  cameraFov: 60,
  clickDistanceThreshold: 0.5,
} as const;
