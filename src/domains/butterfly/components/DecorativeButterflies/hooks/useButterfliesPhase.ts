import * as THREE from "three";

import type {
  ButterflyRuntime,
  FlyAwayTickParams,
  SwarmSlot,
  WaveParams,
} from "../types/types";

// ─── Phase durations (seconds) ───────────────────────────────────────────────

export const PHASE_DURATION = {
  spawn: 4,
  wander: 4,
  gather: 1,
} as const;

export const OPACITY_FADE_IN_DURATION = PHASE_DURATION.spawn * 0.4;

// ─── Scratch vectors — never re-allocated per frame ──────────────────────────

const scratchTangent = new THREE.Vector3();
const scratchWorldUp = new THREE.Vector3(0, 1, 0);
const scratchLerp = new THREE.Vector3();

// ─── Math helpers ─────────────────────────────────────────────────────────────

export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ─── S-wave offset helper ────────────────────────────────────────────────────

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
  const scratchRight = new THREE.Vector3();
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

// ─── Per-phase tick functions ─────────────────────────────────────────────────

export function tickSpawning(
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
  onScale(et * visualScale);

  return t >= 1;
}

export function tickWandering(
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

export function tickGathering(
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

export function tickSwarming(
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

export function tickFlyingAway({
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

// ─── Apply helpers ────────────────────────────────────────────────────────────

export function applyOpacity(
  next: number,
  runtime: ButterflyRuntime,
  opacityRef: React.MutableRefObject<number>
): void {
  const v = Math.max(0, Math.min(1, next));
  if (v === runtime.opacity) return;
  runtime.opacity = v;
  opacityRef.current = v;
}

export function applyScale(
  next: number,
  runtime: ButterflyRuntime,
  group: THREE.Group
): void {
  const v = Math.max(0, Math.min(2, next));
  if (v === runtime.scale) return;
  runtime.scale = v;
  group.scale.setScalar(v);
}
