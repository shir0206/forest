import { PositionThreeD } from "../types/3d";

// Device configuration
export const DEVICE_CONFIG = {
  // Configurable device type strings
  DEVICE_TYPES: {
    MOBILE: "MOBILE",
    DESKTOP: "DESKTOP",
  },

  // Butterfly counts mapped to device types
  butterflyCount: {
    MOBILE: 3,
    DESKTOP: 9,
  },
} as const;

// Device detection utility
export function detectDevice(): "MOBILE" | "DESKTOP" {
  return /iPhone|iPad|Android/i.test(navigator.userAgent) ||
    window.innerWidth < 768
    ? DEVICE_CONFIG.DEVICE_TYPES.MOBILE
    : DEVICE_CONFIG.DEVICE_TYPES.DESKTOP;
}

// Camera animation positions for the scene tour
export const SCENE_ANIMATION_POSITIONS: PositionThreeD[] = [
  [-0.9, -0.4, -0.25], // forest
  [-0.7074, -0.245, -0.3414], // path
  [0.0867, 0.4956, -0.7986], // stone
  [0.9033, 0.3487, -0.25], // waterfall
  [0.9077, 0.2216, 0.3564], // vally
  [0.3057, 0.1594, 0.9387], // workspace
] as const;

// 3D Scene Configuration
export const SCENE_CONFIG = {
  backgroundFile: "hdri/background.webp",
  initCameraPos: SCENE_ANIMATION_POSITIONS[0],
  butterflyPos: [-0.17, -0.08, -0.52] as PositionThreeD,
  animationDuration: 1000,
  cameraTransitionDuration: 1000,
  cameraFov: 60,
  clickDistanceThreshold: 0.5,
} as const;

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

export const CAMERA_ANIMATION_PRESETS = {
  /**
   * Straight line motion with no arc
   * Best for: Short distances, precise positioning, technical movements
   */
  straightLine: {
    arcHeight: 0,
    duration: 1.5,
    ease: "power1.inOut",
  },

  /**
   * Subtle, gentle parabolic arc
   * Best for: Close-range movements, subtle repositioning
   */
  gentleArc: {
    arcHeight: 0.15,
    duration: 2,
    ease: "power2.inOut",
  },

  /**
   * Balanced parabolic arc (default recommendation)
   * Best for: Most use cases, general navigation
   */
  smoothArc: {
    arcHeight: 0.3,
    duration: 2,
    ease: "power1.inOut",
  },

  /**
   * Pronounced dramatic arc
   * Best for: Longer distances, cinematic reveals, attention-grabbing transitions
   */
  dramaticArc: {
    arcHeight: 0.5,
    duration: 2.5,
    ease: "power2.inOut",
  },

  /**
   * Sweeping cinematic arc
   * Best for: Hero moments, grand reveals, showcase animations
   */
  cinematicSweep: {
    arcHeight: 0.6,
    duration: 3,
    ease: "power1.inOut",
  },

  /**
   * Fast snap with minimal arc
   * Best for: Quick UI responses, snappy interactions
   */
  quickSnap: {
    arcHeight: 0.1,
    duration: 1,
    ease: "power3.out",
  },

  /**
   * Slow, luxurious movement with high arc
   * Best for: Premium feel, showcase mode, guided tours
   */
  luxuryGlide: {
    arcHeight: 0.4,
    duration: 3.5,
    ease: "power1.inOut",
  },

  /**
   * Bouncy, playful arc
   * Best for: Fun interactions, gamified experiences
   */
  playfulBounce: {
    arcHeight: 0.35,
    duration: 2,
    ease: "back.out(1.2)",
  },

  /**
   * Elastic overshoot with arc
   * Best for: Attention-grabbing, playful destinations
   */
  elasticArc: {
    arcHeight: 0.3,
    duration: 2.2,
    ease: "elastic.out(1, 0.5)",
  },
} as const;
