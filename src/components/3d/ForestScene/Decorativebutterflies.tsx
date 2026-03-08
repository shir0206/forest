"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Butterfly from "../../ui/Butterfly/Butterfly";
import { useAppContext } from "../../../shared/contexts/AppContext";

// ─── Phase durations (seconds) ───────────────────────────────────────────────
//
// CRITICAL: spawn + wander must be comfortably below flyAwayAfterMs (9s default)
// so that gather + swarm execute before fly-away fires.
//
//   spawn=3s  wander=2s  gather=2s  → total to swarm = 7s
//   flyaway fires at 9s → 2s of visible swarm before scatter
//
const PHASE_DURATION = {
  spawn: 6,
  wander: 2,
  gather: 1,
} as const;

const OPACITY_FADE_IN_DURATION = PHASE_DURATION.spawn * 0.5;

// ─── Scratch vectors — never re-allocated per frame ──────────────────────────

const scratchTangent = new THREE.Vector3();
const scratchWorldUp = new THREE.Vector3(0, 1, 0);
const scratchRight = new THREE.Vector3();
const scratchLerp = new THREE.Vector3();
const scratchForward = new THREE.Vector3();
const scratchCamRight = new THREE.Vector3();
const scratchCamUp = new THREE.Vector3();
const scratchCamWorldUp = new THREE.Vector3(0, 1, 0);

// ─── Phase constants ─────────────────────────────────────────────────────────

const PHASE = {
  SPAWN: "spawn",
  WANDER: "wander",
  GATHER: "gather",
  SWARM: "swarm",
  FLY_AWAY: "flyAway",
} as const;

type Phase = (typeof PHASE)[keyof typeof PHASE];

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface WaveParams {
  amplitude: number;
  frequency: number;
  phaseOffset: number;
}

interface SwarmSlot {
  angleOffset: number;
  orbitRadius: number;
  yOffset: number;
  orbitSpeed: number;
}

interface ButterflyConfig {
  id: number;
  wave: WaveParams;
  flapDuration: { left: number; right: number };
  flyAwayDelay: number;
  swarmSlot: SwarmSlot;
  bobFrequency: number;
  bobAmplitude: number;
}

/**
 * All positions are pre-computed once at creation.
 *
 * "Race-ahead" means each phase targets the camera position N steps AHEAD
 * of where the camera actually is when that phase runs.  The camera then
 * "chases" the butterflies through the scene — butterflies arrive first,
 * orbit briefly, and dart to the next stop just as the camera catches up.
 */
interface ButterflyRuntime {
  config: ButterflyConfig;
  currentPhase: Phase;
  phaseElapsed: number;
  totalElapsed: number;
  opacity: number;
  scale: number;

  spawnOrigin: THREE.Vector3; // edge of frustum at initial camera pos
  wanderTarget: THREE.Vector3; // frustum interior at cam pos + leadSteps
  swarmCenter: THREE.Vector3; // frustum interior at cam pos + leadSteps (gather start)

  flyAwayOrigin: THREE.Vector3 | null;
  flyAwayDestination: THREE.Vector3; // pre-computed from final camera pos
  flyAwayElapsed: number;
  flyAwayDuration: number;

  active: boolean;
}

// ─── Viewport bounds ─────────────────────────────────────────────────────────

interface ViewportBounds {
  /**
   * Spawn origins are placed at this depth multiplier past the scene centre.
   * Values > 1 = further → smaller initial apparent size → dramatic fly-in.
   */
  spawnDepthScale: [number, number];
  /** Fraction of frustum half-height to use as spawn ring radius. */
  spawnEdgeFraction: [number, number];
  /**
   * Fraction of frustum half-height used as max wander spread.
   * Must be large enough that:
   *   halfH * wanderSpreadFraction > wanderOrbitRadius
   * so that maxSpread > 0 and targets don't all collapse to one point.
   */
  wanderSpreadFraction: number;
  /**
   * Max wander orbit radius (world units).
   * Keep below halfH * wanderSpreadFraction to avoid viewport exit.
   */
  wanderOrbitRadius: number;
  /** Swarm orbit is tighter than wander — butterflies cluster visibly. */
  swarmOrbitRadius: [number, number];
  /**
   * Depth spread around butterflyPos along the camera forward axis [min, max].
   * Negative = closer to camera than butterflyPos, positive = further away.
   * e.g. [-0.4, 0.6] distributes butterflies in a 1-unit band of depth,
   * so some appear in front of the special butterfly and some behind it.
   */
  depthSpread: [number, number];
  escapeHalfXZ: number;
  escapeY: [number, number];
  escapeDist: [number, number];
}

const DESKTOP_BOUNDS: ViewportBounds = {
  spawnDepthScale: [1.8, 2.4],
  spawnEdgeFraction: [0.7, 1.0],
  wanderSpreadFraction: 0.55,
  wanderOrbitRadius: 0.06,
  swarmOrbitRadius: [0.06, 0.18],
  depthSpread: [-0.4, 0.6], // butterflies span ~1 world unit in depth
  escapeHalfXZ: 8,
  escapeY: [2, 5],
  escapeDist: [8, 13],
};

/**
 * Mobile: narrower portrait frustum, tighter spread so butterflies stay
 * in the vertical band the user can see.
 */
const MOBILE_BOUNDS: ViewportBounds = {
  spawnDepthScale: [1.6, 2.0],
  spawnEdgeFraction: [0.5, 0.8],
  wanderSpreadFraction: 0.4,
  wanderOrbitRadius: 0.04,
  swarmOrbitRadius: [0.03, 0.08],
  depthSpread: [-0.2, 0.35], // tighter depth band on mobile
  escapeHalfXZ: 0.9,
  escapeY: [2.0, 3.5],
  escapeDist: [2.5, 4.0],
};

const BOUNDS = { DESKTOP: DESKTOP_BOUNDS, MOBILE: MOBILE_BOUNDS };

// ─── Camera route helpers ─────────────────────────────────────────────────────
function computeSWaveOffset({
  travelDirection,
  progress,
  wave,
}: {
  travelDirection: THREE.Vector3;
  progress: number;
  wave: WaveParams;
}): THREE.Vector3 {
  scratchTangent.copy(travelDirection).normalize();
  scratchRight.crossVectors(scratchTangent, scratchWorldUp).normalize();

  const fadeEnvelope = Math.sin(progress * Math.PI);
  const waveAngle = progress * Math.PI * 2 * wave.frequency + wave.phaseOffset;
  const lateralOffset = Math.sin(waveAngle) * wave.amplitude * fadeEnvelope;
  const verticalOffset =
    Math.cos(waveAngle) * wave.amplitude * 0.4 * fadeEnvelope;

  return scratchRight
    .clone()
    .multiplyScalar(lateralOffset)
    .setY(verticalOffset);
}
/**
 * Returns the camera position at `absoluteMs` milliseconds after mount,
 * clamped to the last position once the tour completes.
 */
function getCameraPositionAtMs(
  positions: readonly (readonly [number, number, number])[],
  transitionMs: number,
  absoluteMs: number
): THREE.Vector3 {
  if (positions.length === 0) return new THREE.Vector3();
  const idx = Math.min(
    Math.floor(absoluteMs / transitionMs),
    positions.length - 1
  );
  const p = positions[idx];
  return new THREE.Vector3(p[0], p[1], p[2]);
}

/**
 * Returns the camera position `leadSteps` stops AHEAD of where the camera
 * will be at `absoluteMs`.  This is the core of the "race-ahead" effect:
 * butterflies target a position the camera hasn't reached yet.
 */
function getLeadCameraPosition(
  positions: readonly (readonly [number, number, number])[],
  transitionMs: number,
  absoluteMs: number,
  leadSteps: number
): THREE.Vector3 {
  if (positions.length === 0) return new THREE.Vector3();
  const currentIdx = Math.floor(absoluteMs / transitionMs);
  const leadIdx = Math.min(currentIdx + leadSteps, positions.length - 1);
  const p = positions[leadIdx];
  return new THREE.Vector3(p[0], p[1], p[2]);
}

// ─── Scene-centre derivation ─────────────────────────────────────────────────

/**
 * Derives the scene centre purely from the camera route.
 * No external reference point (butterflyPos or any other anchor) is needed.
 *
 * Because the camera orbits a fixed subject, the centroid of all positions
 * points away from that subject — negating it recovers the subject location.
 * For a symmetric sphere orbit this resolves to exactly (0,0,0).
 * Moving or removing the special butterfly has zero effect on this value.
 */
function deriveSceneCenter(
  positions: readonly (readonly [number, number, number])[]
): THREE.Vector3 {
  if (positions.length === 0) return new THREE.Vector3();
  let sx = 0,
    sy = 0,
    sz = 0;
  for (const p of positions) {
    sx += p[0];
    sy += p[1];
    sz += p[2];
  }
  const n = positions.length;
  const cx = sx / n,
    cy = sy / n,
    cz = sz / n;
  const lenSq = cx * cx + cy * cy + cz * cz;
  // symmetric orbit → centroid ≈ 0 → scene centre is origin
  if (lenSq < 0.001) return new THREE.Vector3(0, 0, 0);
  // asymmetric orbit → negate centroid to point toward scene anchor
  const len = Math.sqrt(lenSq);
  return new THREE.Vector3(
    (-cx / len) * len,
    (-cy / len) * len,
    (-cz / len) * len
  );
}

// ─── Camera-basis helpers ─────────────────────────────────────────────────────

/**
 * Builds right/up/forward basis into module-level scratch vectors.
 * Callers must consume results before any other basis call.
 */
function buildCameraBasis(camPos: THREE.Vector3, lookAt: THREE.Vector3): void {
  scratchForward.subVectors(lookAt, camPos).normalize();
  scratchCamRight.crossVectors(scratchForward, scratchCamWorldUp).normalize();
  scratchCamUp.crossVectors(scratchCamRight, scratchForward).normalize();
}

// ─── Per-phase target samplers ────────────────────────────────────────────────

/**
 * Spawn origin — outside the frustum, at greater depth.
 * Double depth → half apparent size via perspective → butterfly grows as it
 * approaches, combined with scale 0→1.
 */
function computeSpawnOrigin(
  bounds: ViewportBounds,
  camPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  fovDeg: number
): THREE.Vector3 {
  buildCameraBasis(camPos, lookAt);

  const depth = camPos.distanceTo(lookAt);
  const [mn, mx] = bounds.spawnDepthScale;
  const spawnD = depth * (mn + Math.random() * (mx - mn));
  const halfH = spawnD * Math.tan((fovDeg / 2) * (Math.PI / 180));
  const [eMin, eMax] = bounds.spawnEdgeFraction;
  const radius = halfH * (eMin + Math.random() * (eMax - eMin));
  const angle = Math.random() * Math.PI * 2;

  return camPos
    .clone()
    .addScaledVector(scratchForward, spawnD)
    .addScaledVector(scratchCamRight, Math.cos(angle) * radius)
    .addScaledVector(scratchCamUp, Math.sin(angle) * radius);
}

/**
 * Wander target — scattered inside the frustum of the LEAD camera position.
 *
 * maxSpread formula ensures maxSpread > 0:
 *   maxSpread = halfH * wanderSpreadFraction - wanderOrbitRadius
 *
 * The "lead" camera position is N stops ahead of where the camera is when
 * wander starts — butterflies orbit a location the camera hasn't reached yet.
 */
function computeWanderTarget(
  bounds: ViewportBounds,
  leadCamPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  fovDeg: number
): THREE.Vector3 {
  buildCameraBasis(leadCamPos, lookAt);

  const depth = leadCamPos.distanceTo(lookAt);
  const halfH = depth * Math.tan((fovDeg / 2) * (Math.PI / 180));
  const maxSpread = Math.max(
    0.05,
    halfH * bounds.wanderSpreadFraction - bounds.wanderOrbitRadius
  );

  const r = Math.random() * maxSpread;
  const angle = Math.random() * Math.PI * 2;

  // Depth offset along the camera forward axis — distributes butterflies
  // in front of AND behind butterflyPos so they are not all coplanar.
  const [dMin, dMax] = bounds.depthSpread;
  const depthOffset = dMin + Math.random() * (dMax - dMin);

  return lookAt
    .clone()
    .addScaledVector(scratchCamRight, Math.cos(angle) * r)
    .addScaledVector(scratchCamUp, Math.sin(angle) * r)
    .addScaledVector(scratchForward, depthOffset);
}

/**
 * Swarm center — a point around the LEAD camera look-at, with depth variation.
 * Each butterfly gets its own swarmCenter so the swarm has genuine 3-D depth:
 * some butterflies orbit in front of butterflyPos, some behind it.
 */
function computeSwarmCenter(
  leadCamPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  bounds: ViewportBounds
): THREE.Vector3 {
  buildCameraBasis(leadCamPos, lookAt);
  const jitter = 0.04;
  const [dMin, dMax] = bounds.depthSpread;
  const depthOffset = dMin + Math.random() * (dMax - dMin);

  return lookAt
    .clone()
    .addScaledVector(scratchCamRight, (Math.random() - 0.5) * jitter)
    .addScaledVector(scratchCamUp, (Math.random() - 0.5) * jitter)
    .addScaledVector(scratchForward, depthOffset);
}

/**
 * Escape destination — built from the final camera position so the butterfly
 * exits in a direction that's meaningful from the last scene stop.
 */
function computeEscapeTarget(
  fromPos: THREE.Vector3,
  finalCamPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  bounds: ViewportBounds,
  fovDeg: number
): THREE.Vector3 {
  buildCameraBasis(finalCamPos, lookAt);

  const [mn, mx] = bounds.escapeDist;
  const dist = mn + Math.random() * (mx - mn);
  const angle = Math.random() * Math.PI * 2;
  const clamp = bounds.escapeHalfXZ;
  const [yMn, yMx] = bounds.escapeY;
  const depthBoost = yMn + Math.random() * (yMx - yMn);

  return fromPos
    .clone()
    .addScaledVector(
      scratchCamRight,
      Math.max(-clamp, Math.min(clamp, Math.cos(angle) * dist))
    )
    .addScaledVector(
      scratchCamUp,
      Math.max(0, Math.min(clamp, Math.sin(angle) * dist)) // always exit upward
    )
    .addScaledVector(scratchForward, depthBoost);
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ─── Per-phase tick functions ─────────────────────────────────────────────────

function tickSpawning(
  group: THREE.Group,
  phaseElapsed: number,
  spawnOrigin: THREE.Vector3,
  wanderTarget: THREE.Vector3,
  wave: WaveParams,
  onOpacity: (v: number) => void,
  onScale: (v: number) => void
): boolean {
  const t = Math.min(phaseElapsed / PHASE_DURATION.spawn, 1);
  const et = smoothStep(t);

  scratchLerp.lerpVectors(spawnOrigin, wanderTarget, et);
  const dir = scratchTangent.subVectors(wanderTarget, spawnOrigin).normalize();
  group.position
    .copy(scratchLerp)
    .add(computeSWaveOffset({ travelDirection: dir, progress: t, wave }));

  onOpacity(smoothStep(Math.min(phaseElapsed / OPACITY_FADE_IN_DURATION, 1)));
  onScale(et); // 0 → 1 over spawn duration

  return t >= 1;
}

function tickWandering(
  group: THREE.Group,
  phaseElapsed: number,
  wanderTarget: THREE.Vector3,
  wave: WaveParams,
  orbitRadius: number,
  onOpacity: (v: number) => void
): boolean {
  const orbitAngle = phaseElapsed * 1.1 + wave.phaseOffset;
  const breathingR =
    orbitRadius +
    Math.sin(phaseElapsed * 0.6 + wave.phaseOffset) * orbitRadius * 0.35;

  group.position.set(
    wanderTarget.x + Math.cos(orbitAngle) * breathingR,
    wanderTarget.y +
      Math.sin(phaseElapsed * wave.frequency + wave.phaseOffset) *
        wave.amplitude *
        0.5,
    wanderTarget.z + Math.sin(orbitAngle) * breathingR
  );
  onOpacity(1);

  return phaseElapsed >= PHASE_DURATION.wander;
}

function tickGathering(
  group: THREE.Group,
  phaseElapsed: number,
  swarmCenter: THREE.Vector3,
  wave: WaveParams
): boolean {
  const t = Math.min(phaseElapsed / PHASE_DURATION.gather, 1);
  const et = smoothStep(t);

  scratchLerp.lerpVectors(group.position, swarmCenter, et);
  const dir = scratchTangent
    .subVectors(swarmCenter, group.position)
    .normalize();
  group.position
    .copy(scratchLerp)
    .add(computeSWaveOffset({ travelDirection: dir, progress: t, wave }));

  return t >= 1;
}

function tickSwarming(
  group: THREE.Group,
  phaseElapsed: number,
  totalElapsed: number,
  swarmCenter: THREE.Vector3,
  slot: SwarmSlot,
  wave: WaveParams,
  bobFreq: number,
  bobAmp: number
): void {
  const angle = phaseElapsed * slot.orbitSpeed + slot.angleOffset;

  group.position.x = swarmCenter.x + Math.cos(angle) * slot.orbitRadius;
  group.position.z = swarmCenter.z + Math.sin(angle) * slot.orbitRadius;
  group.position.y =
    swarmCenter.y +
    slot.yOffset +
    Math.sin(totalElapsed * bobFreq + wave.phaseOffset) * bobAmp;

  // subtle organic drift so orbit never looks machine-perfect
  const driftAmp = wave.amplitude * 0.15;
  const driftAngle = totalElapsed * wave.frequency * 0.5 + wave.phaseOffset;
  group.position.x += Math.sin(driftAngle) * driftAmp;
  group.position.z += Math.cos(driftAngle) * driftAmp;
}

interface FlyAwayTickParams {
  group: THREE.Group;
  flyAwayElapsed: number;
  flyAwayDuration: number;
  flyAwayStart: THREE.Vector3;
  flyAwayTarget: THREE.Vector3;
  wave: WaveParams;
  setSmoothedOpacity: (opacity: number) => void;
  onComplete: () => void;
}
function tickFlyingAway({
  group,
  flyAwayElapsed,
  flyAwayDuration,
  flyAwayStart,
  flyAwayTarget,
  wave,
  setSmoothedOpacity,
  onComplete,
}: FlyAwayTickParams): void {
  const rawProgress = Math.min(flyAwayElapsed / flyAwayDuration, 1);
  const easedProgress = rawProgress * rawProgress; // quadratic ease-in → accelerates away

  group.position.lerpVectors(flyAwayStart, flyAwayTarget, easedProgress);

  const travelDirection = scratchTangent
    .subVectors(flyAwayTarget, flyAwayStart)
    .normalize();
  const dramaticExitWave: WaveParams = {
    ...wave,
    amplitude: wave.amplitude * 1.4,
  };
  const sWaveDisplacement = computeSWaveOffset({
    travelDirection,
    progress: rawProgress,
    wave: dramaticExitWave,
  });
  group.position.add(sWaveDisplacement);

  setSmoothedOpacity(1 - easedProgress);

  if (rawProgress >= 1) onComplete();
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function applyOpacity(
  next: number,
  runtime: ButterflyRuntime,
  btn: HTMLButtonElement | null
): void {
  const v = Math.max(0, Math.min(1, next));
  if (v === runtime.opacity) return;
  runtime.opacity = v;
  if (btn) btn.style.opacity = String(v);
}

/**
 * Writes scale to both the THREE.Group and the button DOM node.
 * CSS `scale` is the individual transform property — does not conflict with
 * any `transform` the layout system uses for screen-space positioning.
 */
function applyScale(
  next: number,
  runtime: ButterflyRuntime,
  group: THREE.Group,
  btn: HTMLButtonElement | null
): void {
  const v = Math.max(0, Math.min(1, next));
  if (v === runtime.scale) return;
  runtime.scale = v;
  group.scale.setScalar(v);
  if (btn) btn.style.scale = String(v);
}

// ─── Runtime + config factories ───────────────────────────────────────────────

/**
 * Pre-computes all per-butterfly positions using the known camera route.
 *
 * "Lead steps" offset:
 *   Each phase targets a camera position N stops ahead of where the camera
 *   actually is when that phase starts.  This makes butterflies appear to
 *   race ahead — they orbit a destination the camera hasn't reached yet,
 *   and scatter again just as the camera arrives.
 *
 * Phase timing (absolute ms from mount):
 *   wander  starts at  PHASE_DURATION.spawn * 1000
 *   gather  starts at (PHASE_DURATION.spawn + PHASE_DURATION.wander) * 1000
 */
function createButterflyRuntime(
  config: ButterflyConfig,
  bounds: ViewportBounds,
  positions: readonly (readonly [number, number, number])[],
  transitionMs: number,
  fovDeg: number,
  leadSteps: number
): ButterflyRuntime {
  // Scene centre derived entirely from the camera route — no external anchor.
  // Removing or moving butterflyPos has zero effect here.
  const sceneCenter = deriveSceneCenter(positions);

  const spawnStartMs = 0;
  const wanderStartMs = PHASE_DURATION.spawn * 1000;
  const gatherStartMs = (PHASE_DURATION.spawn + PHASE_DURATION.wander) * 1000;

  const spawnCamPos = getCameraPositionAtMs(
    positions,
    transitionMs,
    spawnStartMs
  );
  const wanderLeadPos = getLeadCameraPosition(
    positions,
    transitionMs,
    wanderStartMs,
    leadSteps
  );
  const gatherLeadPos = getLeadCameraPosition(
    positions,
    transitionMs,
    gatherStartMs,
    leadSteps
  );
  const finalCamPos = getCameraPositionAtMs(
    positions,
    transitionMs,
    positions.length * transitionMs + 99999
  );

  const spawnOrigin = computeSpawnOrigin(
    bounds,
    spawnCamPos,
    sceneCenter,
    fovDeg
  );
  const wanderTarget = computeWanderTarget(
    bounds,
    wanderLeadPos,
    sceneCenter,
    fovDeg
  );
  const swarmCenter = computeSwarmCenter(gatherLeadPos, sceneCenter, bounds);
  const flyAwayDest = computeEscapeTarget(
    swarmCenter,
    finalCamPos,
    sceneCenter,
    bounds,
    fovDeg
  );

  return {
    config,
    currentPhase: PHASE.SPAWN,
    phaseElapsed: 0,
    totalElapsed: 0,
    opacity: 0,
    scale: 0,
    spawnOrigin,
    wanderTarget,
    swarmCenter,
    flyAwayOrigin: null,
    flyAwayDestination: flyAwayDest,
    flyAwayElapsed: 0,
    flyAwayDuration: 1.4 + Math.random() * 0.8,
    active: true,
  };
}

function createButterflyConfigs(
  count: number,
  bounds: ViewportBounds
): ButterflyConfig[] {
  const [rMin, rMax] = bounds.swarmOrbitRadius;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    wave: {
      amplitude: 0.18 + Math.random() * 0.22,
      frequency: 1.5 + Math.random() * 1.0,
      phaseOffset: Math.random() * Math.PI * 2,
    },
    flapDuration: {
      left: 120 + Math.random() * 140,
      right: 120 + Math.random() * 140,
    },
    flyAwayDelay: i * 0.14 + Math.random() * 0.2,
    swarmSlot: {
      angleOffset: (i / count) * Math.PI * 2 + Math.random() * 0.4,
      orbitRadius: rMin + Math.random() * (rMax - rMin),
      yOffset: (Math.random() - 0.5) * 0.08,
      orbitSpeed: 0.6 + Math.random() * 0.8,
    },
    bobFrequency: 1.5 + Math.random() * 2.0,
    bobAmplitude: 0.02 + Math.random() * 0.03,
  }));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DecorativeButterfliesProps {
  count?: number;
  flyAwayAfterMs?: number;
  /**
   * SCENE_ANIMATION_POSITIONS — all camera stops in order.
   * The scene centre is derived from these positions automatically;
   * no external anchor point (butterflyPos or otherwise) is needed.
   */
  cameraPositions: readonly (readonly [number, number, number])[];
  /** Vertical FOV in degrees (SCENE_CONFIG.cameraFov). Default: 60. */
  cameraFov?: number;
  /** Milliseconds per camera transition (SCENE_CONFIG.cameraTransitionDuration). Default: 1000. */
  cameraTransitionDurationMs?: number;
  /**
   * How many camera stops ahead butterflies target during each phase.
   * Higher values = more "racing ahead" of the camera.
   * Default: 2 — butterflies are always 2 stops ahead of the camera.
   */
  leadSteps?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecorativeButterflies({
  count = 9,
  flyAwayAfterMs = 9000,
  cameraPositions,
  cameraFov = 60,
  cameraTransitionDurationMs = 1000,
  leadSteps = 2,
}: DecorativeButterfliesProps) {
  const appContext = useAppContext();

  // Handle missing AppContext gracefully
  if (!appContext) {
    console.error(
      "Decorative Butterflies: AppContext not found, using default bounds"
    );
    // Return null or a fallback component when context is unavailable
    return null;
  }

  const { device } = appContext;

  // Safely access bounds with proper type checking
  const bounds = device === "MOBILE" ? BOUNDS.MOBILE : BOUNDS.DESKTOP;

  const configs = useMemo(
    () => createButterflyConfigs(count, bounds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, device]
  );

  const allRuntimes = useRef<ButterflyRuntime[]>(
    configs.map((cfg) =>
      createButterflyRuntime(
        cfg,
        bounds,
        cameraPositions,
        cameraTransitionDurationMs,
        cameraFov,
        leadSteps
      )
    )
  );

  const groupRefs = useRef<(THREE.Group | null)[]>(Array(count).fill(null));
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>(
    Array(count).fill(null)
  );

  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  // ─── Fly-away trigger ──────────────────────────────────────────────────────
  // flyAwayDestination is pre-computed — the timeout only switches the phase.

  useEffect(() => {
    const outerTimer = setTimeout(() => {
      allRuntimes.current.forEach((runtime) => {
        if (!runtime.active) return;

        const innerTimer = setTimeout(() => {
          const group = groupRefs.current[runtime.config.id];
          if (!group || !runtime.active) return;

          runtime.flyAwayOrigin = group.position.clone();
          // flyAwayDestination was pre-computed from the final camera position
          runtime.flyAwayElapsed = 0;
          runtime.currentPhase = PHASE.FLY_AWAY;
          runtime.phaseElapsed = 0;
        }, runtime.config.flyAwayDelay * 1000);

        (runtime as any)._flyAwayTimer = innerTimer;
      });
    }, flyAwayAfterMs);

    return () => {
      clearTimeout(outerTimer);
      allRuntimes.current.forEach((runtime) => {
        if ((runtime as any)._flyAwayTimer !== undefined) {
          clearTimeout((runtime as any)._flyAwayTimer);
        }
      });
    };
  }, [flyAwayAfterMs]);

  // ─── Single frame loop ─────────────────────────────────────────────────────

  useFrame((_, delta) => {
    for (let i = 0; i < allRuntimes.current.length; i++) {
      const runtime = allRuntimes.current[i];
      if (!runtime.active) continue;

      const group = groupRefs.current[i];
      if (!group) continue;

      runtime.totalElapsed += delta;
      runtime.phaseElapsed += delta;

      const btn = buttonRefs.current[i];
      const bds = boundsRef.current;

      switch (runtime.currentPhase) {
        case PHASE.SPAWN: {
          const done = tickSpawning(
            group,
            runtime.phaseElapsed,
            runtime.spawnOrigin,
            runtime.wanderTarget,
            runtime.config.wave,
            (v) => applyOpacity(v, runtime, btn),
            (v) => applyScale(v, runtime, group, btn)
          );
          if (done) {
            console.log(
              "%cSPAWN phase ended",
              "color: pink; font-weight: bold"
            );
            console.log(
              "%cWANDER phase started",
              "color: pink; font-weight: bold"
            );
            runtime.currentPhase = PHASE.WANDER;
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case PHASE.WANDER: {
          const done = tickWandering(
            group,
            runtime.phaseElapsed,
            runtime.wanderTarget,
            runtime.config.wave,
            bds.wanderOrbitRadius,
            (v) => applyOpacity(v, runtime, btn)
          );
          if (done) {
            console.log(
              "%cWANDER phase ended",
              "color: pink; font-weight: bold"
            );
            console.log(
              "%cGATHER phase started",
              "color: pink; font-weight: bold"
            );
            runtime.currentPhase = PHASE.GATHER;
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case PHASE.GATHER: {
          const done = tickGathering(
            group,
            runtime.phaseElapsed,
            runtime.swarmCenter,
            runtime.config.wave
          );
          if (done) {
            console.log(
              "%cGATHER phase ended",
              "color: pink; font-weight: bold"
            );
            console.log(
              "%cSWARM phase started",
              "color: pink; font-weight: bold"
            );
            runtime.currentPhase = PHASE.SWARM;
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case PHASE.SWARM: {
          tickSwarming(
            group,
            runtime.phaseElapsed,
            runtime.totalElapsed,
            runtime.swarmCenter,
            runtime.config.swarmSlot,
            runtime.config.wave,
            runtime.config.bobFrequency,
            runtime.config.bobAmplitude
          );
          break;
        }

        case PHASE.FLY_AWAY: {
          if (!runtime.flyAwayOrigin) break;
          runtime.flyAwayElapsed += delta;
          // tickFlyingAway(
          //   group,
          //   runtime.flyAwayElapsed,
          //   runtime.flyAwayDuration,
          //   runtime.flyAwayOrigin,
          //   runtime.flyAwayDestination,
          //   runtime.config.wave,
          //   (v) => applyOpacity(v, runtime, btn),
          //   () => {
          //     console.log(
          //       "%cFLY_AWAY phase ended",
          //       "color: pink; font-weight: bold"
          //     );
          //     runtime.active = false;
          //     setGoneIds((prev) => new Set(prev).add(runtime.config.id));
          //   }
          // );
          tickFlyingAway({
            group,
            flyAwayElapsed: runtime.flyAwayElapsed,
            flyAwayDuration: runtime.flyAwayDuration, // per-butterfly
            flyAwayStart: runtime.flyAwayOrigin,
            flyAwayTarget: runtime.flyAwayDestination,
            wave: runtime.config.wave, // per-butterfly
            setSmoothedOpacity: (next) => applyOpacity(next, runtime, btn),
            onComplete: () => {
              runtime.active = false;
              // Only setState call in the whole loop — fires once per butterfly,
              // only when it finishes flying away and its <group> can be removed.
              setGoneIds((prev) => new Set(prev).add(runtime.config.id));
            },
          });
          break;
        }
      }
    }
  });

  if (goneIds.size >= count) return null;

  return (
    <>
      {configs
        .filter((cfg) => !goneIds.has(cfg.id))
        .map((cfg, i) => (
          <group
            key={cfg.id}
            ref={(el) => {
              groupRefs.current[i] = el;
              if (el) el.scale.setScalar(0);
            }}
          >
            <Butterfly
              decorative
              flapDuration={cfg.flapDuration}
              buttonRef={
                {
                  get current() {
                    return buttonRefs.current[i];
                  },
                  set current(el: HTMLButtonElement | null) {
                    buttonRefs.current[i] = el;
                    if (el) {
                      el.style.opacity = "0";
                      el.style.scale = "0";
                    }
                  },
                } as React.RefObject<HTMLButtonElement | null>
              }
            />
          </group>
        ))}
    </>
  );
}
