import * as THREE from "three";

import { ANIMATION_TIME_SCALE } from "../../core/constants";
import type {
  ButterflyConfig,
  ButterflyRuntime,
  ViewportBounds,
} from "./types";
import { PHASE_DURATION } from "./useButterfliesPhase";

// ─── Scratch vectors — never re-allocated per frame ──────────────────────────

const scratchForward = new THREE.Vector3();
const scratchCamRight = new THREE.Vector3();
const scratchCamUp = new THREE.Vector3();
const scratchCamWorldUp = new THREE.Vector3(0, 1, 0);

// ─── Camera route helpers ─────────────────────────────────────────────────────

export function getCameraPositionAtMs(
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

export function getLeadCameraPosition(
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

export function deriveSceneCenter(
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

export function computeSpawnOrigin(
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

export function computeWanderTarget(
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

export function computeSwarmCenter(
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

export function computeEscapeTarget(
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

// ─── Runtime + config factories ───────────────────────────────────────────────

export function createButterflyRuntime(
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
    currentPhase: "spawn",
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

export function createButterflyConfigs(
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
