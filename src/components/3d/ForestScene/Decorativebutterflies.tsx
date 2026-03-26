"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import { DEVICE_TYPE } from "../../../domains/context/types";
import { useAppContext } from "../../../shared/contexts/AppContext";
import ButterflyWebGL from "./butterfly/ButterflyWebGL";
import { ANIMATION_TIME_SCALE } from "./butterfly/constants";

// ─── Phase durations (seconds) ───────────────────────────────────────────────
const PHASE_DURATION = {
  spawn: 4,
  wander: 4,
  gather: 1,
} as const;

const OPACITY_FADE_IN_DURATION = PHASE_DURATION.spawn * 0.4;

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
  /**
   * Each butterfly has its own permanent visual scale (0.55–1.0).
   * During spawn the butterfly grows 0 → visualScale.
   * All subsequent phases keep it at visualScale — giving the swarm
   * a natural mix of large and small individuals.
   */
  visualScale: number;
}

interface ButterflyRuntime {
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
  flyAwayTimer?: number;
}

// ─── Viewport bounds ─────────────────────────────────────────────────────────

interface ViewportBounds {
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

const DESKTOP_BOUNDS: ViewportBounds = {
  spawnDepthScale: [1.8, 2.4],
  spawnEdgeFraction: [0.7, 1.0],
  wanderSpreadFraction: 0.55,
  wanderOrbitRadius: 0.06,
  wanderYFraction: 0.7, // use 70% of frustum height for vertical spread
  swarmOrbitRadius: [0.06, 0.18],
  depthSpread: [-0.4, 0.6],
  escapeHalfXZ: 8,
  escapeY: [2, 5],
  escapeDist: [8, 13],
};

const MOBILE_BOUNDS: ViewportBounds = {
  spawnDepthScale: [1.6, 2.0],
  spawnEdgeFraction: [0.5, 0.8],
  wanderSpreadFraction: 0.4,
  wanderOrbitRadius: 0.04,
  wanderYFraction: 0.55, // narrower portrait screen — slightly less spread
  swarmOrbitRadius: [0.03, 0.08],
  depthSpread: [-0.2, 0.35],
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
 * Derives the scene centre from the camera route alone.
 * The centroid of positions on a sphere orbit points away from the subject;
 * negating it recovers the subject's approximate world location.
 * For a symmetric orbit this returns (0,0,0) exactly.
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
  if (lenSq < 0.001) return new THREE.Vector3(0, 0, 0);
  const len = Math.sqrt(lenSq);
  return new THREE.Vector3(
    (-cx / len) * len,
    (-cy / len) * len,
    (-cz / len) * len
  );
}

// ─── Camera-basis helpers ─────────────────────────────────────────────────────

function buildCameraBasis(camPos: THREE.Vector3, lookAt: THREE.Vector3): void {
  scratchForward.subVectors(lookAt, camPos).normalize();
  scratchCamRight.crossVectors(scratchForward, scratchCamWorldUp).normalize();
  scratchCamUp.crossVectors(scratchCamRight, scratchForward).normalize();
}

// ─── Per-phase target samplers ────────────────────────────────────────────────

/**
 * Spawn origin — ring centred on `spawnAnchor` (butterflyPos) at greater depth.
 * Double depth → smaller apparent size via perspective, combined with scale 0→1.
 *
 * FIX 1: uses spawnAnchor (butterflyPos) as ring centre, not the derived
 * scene centre, so butterflies visually emerge from around the special butterfly.
 */
function computeSpawnOrigin(
  bounds: ViewportBounds,
  camPos: THREE.Vector3,
  spawnAnchor: THREE.Vector3,
  fovDeg: number
): THREE.Vector3 {
  buildCameraBasis(camPos, spawnAnchor);

  const depth = camPos.distanceTo(spawnAnchor);
  const [mn, mx] = bounds.spawnDepthScale;
  const spawnDepth = depth * (mn + Math.random() * (mx - mn));
  const halfH = spawnDepth * Math.tan((fovDeg / 2) * (Math.PI / 180));
  const [eMin, eMax] = bounds.spawnEdgeFraction;
  const radius = halfH * (eMin + Math.random() * (eMax - eMin));
  const angle = Math.random() * Math.PI * 2;

  return camPos
    .clone()
    .addScaledVector(scratchForward, spawnDepth)
    .addScaledVector(scratchCamRight, Math.cos(angle) * radius)
    .addScaledVector(scratchCamUp, Math.sin(angle) * radius);
}

/**
 * Wander target — scattered in camera space around the scene centre.
 * Spread along right and up axes, plus depth variation.
 */
function computeWanderTarget(
  bounds: ViewportBounds,
  leadCamPos: THREE.Vector3,
  sceneCenter: THREE.Vector3,
  fovDeg: number
): THREE.Vector3 {
  buildCameraBasis(leadCamPos, sceneCenter);

  const depth = leadCamPos.distanceTo(sceneCenter);
  const halfH = depth * Math.tan((fovDeg / 2) * (Math.PI / 180));
  const maxSpread = Math.max(
    0.05,
    halfH * bounds.wanderSpreadFraction - bounds.wanderOrbitRadius
  );

  const r = Math.random() * maxSpread;
  const angle = Math.random() * Math.PI * 2;

  const [dMin, dMax] = bounds.depthSpread;
  const depthOffset = dMin + Math.random() * (dMax - dMin);

  return sceneCenter
    .clone()
    .addScaledVector(scratchCamRight, Math.cos(angle) * r)
    .addScaledVector(scratchCamUp, Math.sin(angle) * r)
    .addScaledVector(scratchForward, depthOffset);
}

/**
 * Swarm center — near scene centre with per-butterfly depth jitter.
 */
function computeSwarmCenter(
  leadCamPos: THREE.Vector3,
  sceneCenter: THREE.Vector3,
  bounds: ViewportBounds
): THREE.Vector3 {
  buildCameraBasis(leadCamPos, sceneCenter);
  const jitter = 0.04;
  const [dMin, dMax] = bounds.depthSpread;
  const depthOffset = dMin + Math.random() * (dMax - dMin);

  return sceneCenter
    .clone()
    .addScaledVector(scratchCamRight, (Math.random() - 0.5) * jitter)
    .addScaledVector(scratchCamUp, (Math.random() - 0.5) * jitter)
    .addScaledVector(scratchForward, depthOffset);
}

/**
 * Escape target — world-space only, no camera basis.
 */
function computeEscapeTarget(
  fromPos: THREE.Vector3,
  bounds: ViewportBounds
): THREE.Vector3 {
  const [minDist, maxDist] = bounds.escapeDist;
  const dist = minDist + Math.random() * (maxDist - minDist);
  const angle = Math.random() * Math.PI * 2;

  const [minY, maxY] = bounds.escapeY;
  const yRise = minY + Math.random() * (maxY - minY);

  return new THREE.Vector3(
    fromPos.x + Math.cos(angle) * dist,
    fromPos.y + yRise,
    fromPos.z + Math.sin(angle) * dist
  );
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
  visualScale: number,
  onOpacity: (v: number) => void,
  onScale: (v: number) => void
): boolean {
  const t = Math.min(phaseElapsed / PHASE_DURATION.spawn, 1);
  const et = smoothStep(t);

  scratchLerp.lerpVectors(spawnOrigin, wanderTarget, et);
  const dir = scratchTangent.subVectors(wanderTarget, spawnOrigin).normalize();
  group.position.copy(scratchLerp).add(
    computeSWaveOffset({
      travelDirection: dir,
      progress: t,
      wave: wave,
    })
  );

  onOpacity(smoothStep(Math.min(phaseElapsed / OPACITY_FADE_IN_DURATION, 1)));
  // Scale grows 0 → visualScale (not always 1.0) for size variety
  onScale(et * visualScale);

  return t >= 1;
}

function tickWandering(
  group: THREE.Group,
  phaseElapsed: number,
  wanderTarget: THREE.Vector3,
  wave: WaveParams,
  orbitRadius: number,
  wanderYRange: number,
  onOpacity: (v: number) => void
): boolean {
  const EASE_IN_DURATION = 0.6;
  const easeScale = smoothStep(Math.min(phaseElapsed / EASE_IN_DURATION, 1));

  const orbitAngle = phaseElapsed * 1.1 + wave.phaseOffset;
  const breathingR =
    (orbitRadius +
      Math.sin(phaseElapsed * 0.6 + wave.phaseOffset) * orbitRadius * 0.35) *
    easeScale;

  group.position.set(
    wanderTarget.x + Math.cos(orbitAngle) * breathingR,
    wanderTarget.y +
      Math.sin(phaseElapsed * wave.frequency + wave.phaseOffset) *
        wanderYRange *
        easeScale,
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
  group.position.copy(scratchLerp).add(
    computeSWaveOffset({
      travelDirection: dir,
      progress: t,
      wave: wave,
    })
  );

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
  const easedProgress = rawProgress * rawProgress;

  group.position.lerpVectors(flyAwayStart, flyAwayTarget, easedProgress);

  //////////////

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
  //////////////
  setSmoothedOpacity(1 - easedProgress);

  if (rawProgress >= 1) onComplete();
}

// ─── Apply helpers ───────────────────────────────────────────────────────────

function applyOpacity(
  next: number,
  runtime: ButterflyRuntime,
  opacityRef: React.MutableRefObject<number>
): void {
  const v = Math.max(0, Math.min(1, next));
  if (v === runtime.opacity) return;
  runtime.opacity = v;
  opacityRef.current = v;
}

function applyScale(
  next: number,
  runtime: ButterflyRuntime,
  group: THREE.Group
): void {
  const v = Math.max(0, Math.min(2, next));
  if (v === runtime.scale) return;
  runtime.scale = v;
  group.scale.setScalar(v);
}

// ─── Runtime + config factories ───────────────────────────────────────────────

function createButterflyRuntime(
  config: ButterflyConfig,
  bounds: ViewportBounds,
  positions: readonly (readonly [number, number, number])[],
  transitionMs: number,
  spawnAnchor: THREE.Vector3,
  fovDeg: number,
  leadSteps: number
): ButterflyRuntime {
  const sceneCenter = deriveSceneCenter(positions);

  const wanderStartMs = PHASE_DURATION.spawn * 1000;
  const gatherStartMs = (PHASE_DURATION.spawn + PHASE_DURATION.wander) * 1000;

  const spawnCamPos = getCameraPositionAtMs(positions, transitionMs, 0);
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

  const spawnOrigin = computeSpawnOrigin(
    bounds,
    spawnCamPos,
    spawnAnchor,
    fovDeg
  );
  const wanderTarget = computeWanderTarget(
    bounds,
    wanderLeadPos,
    sceneCenter,
    fovDeg
  );
  const swarmCenter = computeSwarmCenter(gatherLeadPos, sceneCenter, bounds);
  const flyAwayDest = computeEscapeTarget(swarmCenter, bounds);

  const depth = wanderLeadPos.distanceTo(sceneCenter);
  const halfH = depth * Math.tan((fovDeg / 2) * (Math.PI / 180));
  const wanderYRange = halfH * bounds.wanderYFraction;

  return {
    config,
    currentPhase: PHASE.SPAWN,
    phaseElapsed: 0,
    totalElapsed: 0,
    opacity: 0,
    scale: 0,
    spawnOrigin,
    wanderTarget,
    wanderYRange,
    swarmCenter,
    flyAwayOrigin: null,
    flyAwayDestination: flyAwayDest,
    flyAwayElapsed: 0,
    flyAwayDuration: (1.4 + Math.random() * 0.8) / ANIMATION_TIME_SCALE,
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
      left: 200,
      right: 200,
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
    visualScale: 0.55 + Math.random() * 0.45,
  }));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DecorativeButterfliesProps {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecorativeButterflies({
  count = 9,
  flyAwayAfterMs = 9000 / ANIMATION_TIME_SCALE,
  cameraPositions,
  spawnAnchor,
  cameraFov = 60,
  cameraTransitionDurationMs = 1000,
  leadSteps = 2,
}: DecorativeButterfliesProps) {
  const appContext = useAppContext();
  if (!appContext)
    console.error("Decorative Butterflies: AppContext not found");
  const { device } = appContext;

  const bounds = BOUNDS[device === DEVICE_TYPE.MOBILE ? "MOBILE" : "DESKTOP"];

  const spawnAnchorVec = useMemo(
    () => new THREE.Vector3(spawnAnchor[0], spawnAnchor[1], spawnAnchor[2]),
    [spawnAnchor[0], spawnAnchor[1], spawnAnchor[2]]
  );

  const configs = useMemo(
    () => createButterflyConfigs(count, bounds),
    [count, device]
  );

  const allRuntimes = useRef<ButterflyRuntime[]>(
    configs.map((cfg) =>
      createButterflyRuntime(
        cfg,
        bounds,
        cameraPositions,
        cameraTransitionDurationMs,
        spawnAnchorVec,
        cameraFov,
        leadSteps
      )
    )
  );

  const groupRefs = useRef<(THREE.Group | null)[]>(Array(count).fill(null));
  const opacityRefs = useRef<React.MutableRefObject<number>[]>(
    configs.map(() => ({ current: 0 }))
  );

  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  // ─── Fly-away trigger ──────────────────────────────────────────────────────

  useEffect(() => {
    const outerTimer = setTimeout(() => {
      allRuntimes.current.forEach((runtime) => {
        if (!runtime.active) return;

        const innerTimer = setTimeout(() => {
          const group = groupRefs.current[runtime.config.id];
          if (!group || !runtime.active) return;

          runtime.flyAwayOrigin = group.position.clone();
          runtime.flyAwayElapsed = 0;
          runtime.currentPhase = PHASE.FLY_AWAY;
          runtime.phaseElapsed = 0;
        }, runtime.config.flyAwayDelay * 1000);

        runtime.flyAwayTimer = innerTimer;
      });
    }, flyAwayAfterMs);

    return () => {
      clearTimeout(outerTimer);
      allRuntimes.current.forEach((runtime) => {
        if (runtime.flyAwayTimer !== undefined) {
          clearTimeout(runtime.flyAwayTimer);
        }
      });
    };
  }, [flyAwayAfterMs]);

  // ─── Single frame loop ─────────────────────────────────────────────────────

  useFrame(({ camera }, delta) => {
    for (let i = 0; i < allRuntimes.current.length; i++) {
      const runtime = allRuntimes.current[i];
      if (!runtime.active) continue;

      const group = groupRefs.current[i];
      if (!group) continue;

      runtime.totalElapsed += delta;
      runtime.phaseElapsed += delta;

      const opRef = opacityRefs.current[i];
      const bds = boundsRef.current;

      switch (runtime.currentPhase) {
        case PHASE.SPAWN: {
          const done = tickSpawning(
            group,
            runtime.phaseElapsed,
            runtime.spawnOrigin,
            runtime.wanderTarget,
            runtime.config.wave,
            runtime.config.visualScale,
            (v) => applyOpacity(v, runtime, opRef),
            (v) => applyScale(v, runtime, group)
          );
          if (done) {
            applyScale(runtime.config.visualScale, runtime, group);
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
            runtime.wanderYRange,
            (v) => applyOpacity(v, runtime, opRef)
          );
          if (done) {
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
          tickFlyingAway({
            group,
            flyAwayElapsed: runtime.flyAwayElapsed,
            flyAwayDuration: runtime.flyAwayDuration,
            flyAwayStart: runtime.flyAwayOrigin,
            flyAwayTarget: runtime.flyAwayDestination,
            wave: runtime.config.wave,
            setSmoothedOpacity: (next) => applyOpacity(next, runtime, opRef),
            onComplete: () => {
              runtime.active = false;
              setGoneIds((prev) => new Set(prev).add(runtime.config.id));
            },
          });
          break;
        }
      }

      // ── Billboard: always face the camera ────────────────────────────────
      group.quaternion.copy(camera.quaternion);
    }
  });

  if (goneIds.size >= count) return null;

  return (
    <>
      {configs
        .filter((cfg) => !goneIds.has(cfg.id))
        .map((cfg) => (
          <group
            key={cfg.id}
            ref={(el) => {
              groupRefs.current[cfg.id] = el;
              if (el) el.scale.setScalar(0);
            }}
          >
            <ButterflyWebGL
              flapDurationMs={
                (cfg.flapDuration.left + cfg.flapDuration.right) / 2
              }
              opacityRef={opacityRefs.current[cfg.id]}
              timeOffset={cfg.wave.phaseOffset}
              flipPetals={false}
              mirrorX={false}
              useDecorativePose
            />
          </group>
        ))}
    </>
  );
}
