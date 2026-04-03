import { PositionThreeD } from "../../../shared/types/primitives";

// ─── Scene Tour Camera Positions ─────────────────────────────────────────────
//
// Each position is a 3D world-space coordinate [x, y, z] used as the
// camera's orbit target during the cinematic scene tour.
// - x: horizontal (-1 = left, +1 = right)
// - y: vertical (-1 = below, +1 = above)
// - z: depth (-1 = near, +1 = far)

/** Starting position — focused on the forest area */
export const POS_FOREST: PositionThreeD = [-0.9, -0.4, -0.25];

/** Camera target for the winding path scene */
export const POS_PATH: PositionThreeD = [-0.7074, -0.245, -0.3414];

/** Camera target for the stone feature */
export const POS_STONE: PositionThreeD = [0.0867, 0.4956, -0.7986];

/** Camera target for the waterfall area */
export const POS_WATERFALL: PositionThreeD = [0.9033, 0.3487, -0.25];

/** Camera target for the valley panorama */
export const POS_VALLEY: PositionThreeD = [0.9077, 0.2216, 0.3564];

/** Camera target for the workspace area */
export const POS_WORKSPACE: PositionThreeD = [0.3057, 0.1594, 0.9387];

/** Ordered sequence of camera positions for the scene tour animation */
export const SCENE_ANIMATION_POSITIONS: PositionThreeD[] = [
  POS_FOREST,
  POS_PATH,
  POS_STONE,
  POS_WATERFALL,
  POS_VALLEY,
  POS_WORKSPACE,
];

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
