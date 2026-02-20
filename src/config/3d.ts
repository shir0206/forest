import { PositionThreeD } from "../types/3d";

// 3D Scene Configuration
export const SCENE_CONFIG = {
  backgroundFile:
    "hdri/Gemini_Generated_Image_mrpfnvmrpfnvmrpf_topaz-enhance-6x.webp",
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
