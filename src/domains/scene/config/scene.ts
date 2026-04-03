import { PositionThreeD } from "../../../shared/types/primitives";
import { SCENE_ANIMATION_POSITIONS } from "../../camera/config/presets";

// ─── Scene Configuration ─────────────────────────────────────────────────────

/**
 * Default butterfly position in 3D world space (x, y, z).
 * Centered slightly left, below, and in front of origin.
 */
export const BUTTERFLY_DEFAULT_POS: PositionThreeD = [-0.17, -0.08, -0.52];

/** Default scene transition animation duration in milliseconds */
export const SCENE_ANIMATION_DURATION_MS = 1000;

/** Default camera transition duration in milliseconds */
export const CAMERA_TRANSITION_DURATION_MS = 1000;

/** Default camera field of view in degrees */
export const CAMERA_FOV_DEGREES = 60;

/** Click distance threshold in world units for interactive detection */
export const CLICK_DISTANCE_THRESHOLD = 0.5;

export const SCENE_CONFIG = {
  backgroundFile: "hdri/background.webp",
  initCameraPos: SCENE_ANIMATION_POSITIONS[0],
  butterflyPos: BUTTERFLY_DEFAULT_POS,
  animationDuration: SCENE_ANIMATION_DURATION_MS,
  cameraTransitionDuration: CAMERA_TRANSITION_DURATION_MS,
  cameraFov: CAMERA_FOV_DEGREES,
  clickDistanceThreshold: CLICK_DISTANCE_THRESHOLD,
} as const;
