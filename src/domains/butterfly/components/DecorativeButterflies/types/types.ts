import * as THREE from "three";

// ─── Phase constants ─────────────────────────────────────────────────────────

export const PHASE = {
  SPAWN: "spawn",
  WANDER: "wander",
  GATHER: "gather",
  SWARM: "swarm",
  FLY_AWAY: "flyAway",
} as const;

export type Phase = (typeof PHASE)[keyof typeof PHASE];

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface WaveParams {
  amplitude: number;
  frequency: number;
  phaseOffset: number;
}

export interface SwarmSlot {
  angleOffset: number;
  orbitRadius: number;
  yOffset: number;
  orbitSpeed: number;
}

export interface ButterflyConfig {
  id: number;
  wave: WaveParams;
  flapDuration: { left: number; right: number };
  flyAwayDelay: number;
  swarmSlot: SwarmSlot;
  bobFrequency: number;
  bobAmplitude: number;
  /**
   * Each butterfly has its own permanent visual scale (0.55–1.0).
   * During spawn the butterfly grows 0 → visualScale.
   * All subsequent phases keep it at visualScale — giving the swarm
   * a natural mix of large and small individuals.
   */
  visualScale: number;
}

export interface ButterflyRuntime {
  config: ButterflyConfig;
  currentPhase: Phase;
  phaseElapsed: number;
  totalElapsed: number;
  opacity: number;
  scale: number;

  spawnOrigin: THREE.Vector3;
  wanderTarget: THREE.Vector3;
  /**
   * Frustum-derived vertical range for the wander orbit.
   * Computed once in createButterflyRuntime from the lead camera geometry
   * so it scales correctly to any FOV / camera distance.
   */
  wanderYRange: number;
  swarmCenter: THREE.Vector3;

  flyAwayOrigin: THREE.Vector3 | null;
  flyAwayDestination: THREE.Vector3;
  flyAwayElapsed: number;
  flyAwayDuration: number;

  active: boolean;
  flyAwayTimer?: ReturnType<typeof setTimeout>;
}

// ─── Viewport bounds ─────────────────────────────────────────────────────────

export interface ViewportBounds {
  spawnDepthScale: [number, number];
  spawnEdgeFraction: [number, number];
  wanderSpreadFraction: number;
  wanderOrbitRadius: number;
  /**
   * Fraction of the frustum half-height used as maximum vertical wander range.
   * Larger values → butterflies spread higher/lower during wander.
   */
  wanderYFraction: number;
  swarmOrbitRadius: [number, number];
  depthSpread: [number, number];
  escapeHalfXZ: number;
  escapeY: [number, number];
  escapeDist: [number, number];
}

export const DESKTOP_BOUNDS: ViewportBounds = {
  spawnDepthScale: [1.8, 2.4],
  spawnEdgeFraction: [0.7, 1.0],
  wanderSpreadFraction: 0.55,
  wanderOrbitRadius: 0.06,
  wanderYFraction: 0.7,
  swarmOrbitRadius: [0.06, 0.18],
  depthSpread: [-0.4, 0.6],
  escapeHalfXZ: 8,
  escapeY: [2, 5],
  escapeDist: [8, 13],
};

export const MOBILE_BOUNDS: ViewportBounds = {
  spawnDepthScale: [1.6, 2.0],
  spawnEdgeFraction: [0.5, 0.8],
  wanderSpreadFraction: 0.4,
  wanderOrbitRadius: 0.04,
  wanderYFraction: 0.55,
  swarmOrbitRadius: [0.03, 0.08],
  depthSpread: [-0.2, 0.35],
  escapeHalfXZ: 0.9,
  escapeY: [2.0, 3.5],
  escapeDist: [2.5, 4.0],
};

export const BOUNDS = {
  DESKTOP: DESKTOP_BOUNDS,
  MOBILE: MOBILE_BOUNDS,
};

// ─── Tick function params ────────────────────────────────────────────────────

export interface FlyAwayTickParams {
  group: THREE.Group;
  flyAwayElapsed: number;
  flyAwayDuration: number;
  flyAwayStart: THREE.Vector3;
  flyAwayTarget: THREE.Vector3;
  wave: WaveParams;
  setSmoothedOpacity: (opacity: number) => void;
  onComplete: () => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DecorativeButterfliesProps {
  count?: number;
  flyAwayAfterMs?: number;
  /** SCENE_ANIMATION_POSITIONS — all camera stops in order. */
  cameraPositions: readonly (readonly [number, number, number])[];
  /**
   * World position of the special butterfly (SCENE_CONFIG.butterflyPos).
   * Used ONLY as the spawn ring centre so decorative butterflies emerge
   * from around it.  All other phases are independent of this value.
   */
  spawnAnchor: readonly [number, number, number];
  /** Vertical FOV in degrees (SCENE_CONFIG.cameraFov). Default: 60. */
  cameraFov?: number;
  /** Milliseconds per camera transition. Default: 1000. */
  cameraTransitionDurationMs?: number;
  /** How many camera stops ahead butterflies target. Default: 2. */
  leadSteps?: number;
}
