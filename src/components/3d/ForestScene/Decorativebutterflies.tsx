"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Butterfly from "../../ui/Butterfly/Butterfly";

// ─── Phase durations (seconds) ───────────────────────────────────────────────

const PHASE_DURATION = {
  spawn: 5,
  wander: 5,
  gather: 2,
} as const;

// How quickly opacity fades in during spawn, in seconds.
// Independent of PHASE_DURATION.spawn so position/scale can take longer.
const OPACITY_FADE_IN_DURATION = PHASE_DURATION.spawn * 0.4;

const SWARM_CENTER = new THREE.Vector3(0, 0.3, 0);

// Reusable scratch vectors — never re-allocated per frame
const scratchTangent = new THREE.Vector3();
const scratchWorldUp = new THREE.Vector3(0, 1, 0);
const scratchRight = new THREE.Vector3();
const scratchLerp = new THREE.Vector3();

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "spawning" | "wandering" | "gathering" | "swarming" | "flyingAway";

interface WaveParams {
  /** How wide the S-curve swings left/right */
  amplitude: number;
  /** How many full S-cycles occur over the travel distance */
  frequency: number;
  /** Per-butterfly offset so no two butterflies move in lockstep */
  phaseOffset: number;
}

interface SwarmSlot {
  /** Starting angle on the shared orbit ring so butterflies spread out evenly */
  angleOffset: number;
  /** Distance from SWARM_CENTER while orbiting */
  orbitRadius: number;
  /** Fixed height offset inside the swarm cloud */
  yOffset: number;
  /** How fast (rad/s) the butterfly circles the swarm center */
  orbitSpeed: number;
}

interface ButterflyConfig {
  id: number;
  wave: WaveParams;
  /** Wing-flap cycle time in ms, randomised per side for an organic feel */
  flapDuration: { left: number; right: number };
  /** Seconds after flyAway fires before this individual starts leaving (stagger) */
  flyAwayDelay: number;
  /** The personal hover point this butterfly orbits during the wander phase */
  wanderTarget: THREE.Vector3;
  swarmSlot: SwarmSlot;
  /** Vertical bob frequency (rad/s) while swarming */
  bobFrequency: number;
  /** Vertical bob amplitude while swarming */
  bobAmplitude: number;
}

/**
 * Mutable per-butterfly animation runtime.
 * Lives in a plain ref array — never in React state — so frame-by-frame
 * mutations here never schedule a React re-render.
 */
interface ButterflyRuntime {
  /** Static config set at creation — never mutated during animation */
  config: ButterflyConfig;

  // ── Phase machine ──────────────────────────────────────────────────────────
  // Each butterfly advances independently through its own phase sequence.
  currentPhase: Phase;
  /** Seconds elapsed in the current phase — resets to 0 on each phase transition */
  phaseElapsed: number;
  /** Seconds elapsed since this butterfly was created — never resets */
  totalElapsed: number;

  // ── Opacity ────────────────────────────────────────────────────────────────
  // Written directly to the DOM node via buttonRefs; never goes through setState.
  opacity: number;

  // ── Spawning ───────────────────────────────────────────────────────────────
  spawnOrigin: THREE.Vector3;

  // ── Flying away ────────────────────────────────────────────────────────────
  // Populated only when the fly-away trigger fires for this individual.
  flyAwayOrigin: THREE.Vector3 | null;
  flyAwayDestination: THREE.Vector3 | null;
  flyAwayElapsed: number;
  flyAwayDuration: number;

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  /** Flipped to false when fly-away completes; the frame loop skips it after that */
  active: boolean;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

/** Maps t ∈ [0,1] onto a smooth S-curve (no sudden jumps at endpoints) */
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Returns a displacement vector perpendicular to `travelDirection` that traces
 * an S-wave. Enveloped by sin(πt) so the wave fades in and out at both ends,
 * giving every flight path a clean entry and exit.
 */
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

/** Picks a random point on a ring far outside the visible scene to spawn from */
function randomSpawnOrigin(): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 4 + Math.random() * 2;
  return new THREE.Vector3(
    Math.cos(angle) * distanceFromCenter,
    -0.5 + Math.random() * 1.0,
    Math.sin(angle) * distanceFromCenter
  );
}

/** Picks a random escape point well outside the scene for the fly-away phase */
function randomEscapeTarget(fromPosition: THREE.Vector3): THREE.Vector3 {
  const escapeAngle = Math.random() * Math.PI * 2;
  const escapeDistance = 8 + Math.random() * 5;
  return new THREE.Vector3(
    fromPosition.x + Math.cos(escapeAngle) * escapeDistance,
    fromPosition.y + 2 + Math.random() * 3,
    fromPosition.z + Math.sin(escapeAngle) * escapeDistance
  );
}

// ─── Per-phase tick functions ─────────────────────────────────────────────────

interface SpawnTickParams {
  group: THREE.Group;
  phaseElapsed: number;
  spawnOrigin: THREE.Vector3;
  wanderTarget: THREE.Vector3;
  wave: WaveParams;
  setSmoothedOpacity: (opacity: number) => void;
}

/**
 * Moves the butterfly from its off-screen spawn origin toward its personal
 * wander target. Grows from near-invisible (scale ≈ 0) to full size and fades
 * in. An S-wave is applied perpendicular to the travel direction so the entry
 * path looks alive rather than mechanical.
 * Returns `true` when the phase is complete.
 */
function tickSpawning({
  group,
  phaseElapsed,
  spawnOrigin,
  wanderTarget,
  wave,
  setSmoothedOpacity,
}: SpawnTickParams): boolean {
  const rawProgress = Math.min(phaseElapsed / PHASE_DURATION.spawn, 1);
  const easedProgress = smoothStep(rawProgress);

  // Opacity reaches 1 after OPACITY_FADE_IN_DURATION seconds,
  // independent of the full 5s spawn movement and scale animation.
  const opacityProgress = Math.min(phaseElapsed / OPACITY_FADE_IN_DURATION, 1);
  const easedOpacity = smoothStep(opacityProgress);

  scratchLerp.lerpVectors(spawnOrigin, wanderTarget, easedProgress);

  const travelDirection = scratchTangent
    .subVectors(wanderTarget, spawnOrigin)
    .normalize();
  const sWaveDisplacement = computeSWaveOffset({
    travelDirection,
    progress: rawProgress,
    wave,
  });

  group.position.copy(scratchLerp).add(sWaveDisplacement);
  group.scale.setScalar(easedProgress);
  setSmoothedOpacity(easedOpacity);

  return rawProgress >= 1;
}

interface WanderTickParams {
  group: THREE.Group;
  phaseElapsed: number;
  wanderTarget: THREE.Vector3;
  wave: WaveParams;
  setSmoothedOpacity: (opacity: number) => void;
}

/**
 * Keeps the butterfly lazily circling its personal wander target.
 * The orbit radius breathes slowly so the path never looks like a fixed loop.
 * Returns `true` when the phase is complete.
 */
function tickWandering({
  group,
  phaseElapsed,
  wanderTarget,
  wave,
  setSmoothedOpacity,
}: WanderTickParams): boolean {
  const orbitAngle = phaseElapsed * 1.1 + wave.phaseOffset;
  const breathingOrbitRadius =
    0.28 + Math.sin(phaseElapsed * 0.6 + wave.phaseOffset) * 0.12;

  group.position.set(
    wanderTarget.x + Math.cos(orbitAngle) * breathingOrbitRadius,
    wanderTarget.y +
      Math.sin(phaseElapsed * wave.frequency + wave.phaseOffset) *
        wave.amplitude *
        0.5,
    wanderTarget.z + Math.sin(orbitAngle) * breathingOrbitRadius
  );
  setSmoothedOpacity(1);

  return phaseElapsed >= PHASE_DURATION.wander;
}

interface GatherTickParams {
  group: THREE.Group;
  phaseElapsed: number;
  wave: WaveParams;
}

/**
 * Curves the butterfly toward SWARM_CENTER using a smooth-step lerp so it
 * doesn't just teleport. An S-wave flourish keeps the path feeling organic.
 * Returns `true` when the phase is complete.
 */
function tickGathering({
  group,
  phaseElapsed,
  wave,
}: GatherTickParams): boolean {
  const rawProgress = Math.min(phaseElapsed / PHASE_DURATION.gather, 1);
  const easedProgress = smoothStep(rawProgress);

  scratchLerp.lerpVectors(group.position, SWARM_CENTER, easedProgress);

  const travelDirection = scratchTangent
    .subVectors(SWARM_CENTER, group.position)
    .normalize();
  const sWaveDisplacement = computeSWaveOffset({
    travelDirection,
    progress: rawProgress,
    wave,
  });

  group.position.copy(scratchLerp).add(sWaveDisplacement);

  return rawProgress >= 1;
}

interface SwarmTickParams {
  group: THREE.Group;
  phaseElapsed: number;
  totalElapsed: number;
  swarmSlot: SwarmSlot;
  wave: WaveParams;
  bobFrequency: number;
  bobAmplitude: number;
}

/**
 * Keeps the butterfly in a tight orbit around SWARM_CENTER.
 * A slow secondary drift (derived from the wave params) prevents the path
 * from looking perfectly circular.
 */
function tickSwarming({
  group,
  phaseElapsed,
  totalElapsed,
  swarmSlot,
  wave,
  bobFrequency,
  bobAmplitude,
}: SwarmTickParams): void {
  const { angleOffset, orbitRadius, yOffset, orbitSpeed } = swarmSlot;
  const currentOrbitAngle = phaseElapsed * orbitSpeed + angleOffset;

  group.position.x = SWARM_CENTER.x + Math.cos(currentOrbitAngle) * orbitRadius;
  group.position.z = SWARM_CENTER.z + Math.sin(currentOrbitAngle) * orbitRadius;
  group.position.y =
    SWARM_CENTER.y +
    yOffset +
    Math.sin(totalElapsed * bobFrequency + wave.phaseOffset) * bobAmplitude;

  // Slow organic drift so the orbit doesn't look machine-perfect
  const driftAmplitude = wave.amplitude * 0.2;
  const driftAngle = totalElapsed * wave.frequency * 0.5 + wave.phaseOffset;
  group.position.x += Math.sin(driftAngle) * driftAmplitude;
  group.position.z += Math.cos(driftAngle) * driftAmplitude;
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

/**
 * Accelerates the butterfly toward its random escape target using a quadratic
 * ease-in so it feels like it's launching away. Boosts the S-wave amplitude for
 * a more dramatic exit, fades out as it goes, and calls `onComplete` when done.
 */
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

// ─── Runtime factory ──────────────────────────────────────────────────────────

function createButterflyRuntime(config: ButterflyConfig): ButterflyRuntime {
  return {
    config,
    currentPhase: "spawning",
    phaseElapsed: 0,
    totalElapsed: 0,
    opacity: 0,
    spawnOrigin: randomSpawnOrigin(),
    flyAwayOrigin: null,
    flyAwayDestination: null,
    flyAwayElapsed: 0,
    flyAwayDuration: 1.4 + Math.random() * 0.8,
    active: true,
  };
}

// ─── Config factory ───────────────────────────────────────────────────────────

function createButterflyConfigs(count: number): ButterflyConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    wave: {
      amplitude: 0.18 + Math.random() * 0.22,
      frequency: 1.5 + Math.random() * 1.0,
      phaseOffset: Math.random() * Math.PI * 2,
    },
    flapDuration: {
      left: 80 + Math.random() * 140,
      right: 80 + Math.random() * 140,
    },
    flyAwayDelay: i * 0.14 + Math.random() * 0.2,
    wanderTarget: new THREE.Vector3(
      (Math.random() - 0.5) * 2.5,
      0.1 + Math.random() * 0.8,
      (Math.random() - 0.5) * 2.5
    ),
    swarmSlot: {
      angleOffset: (i / count) * Math.PI * 2 + Math.random() * 0.4,
      orbitRadius: 0.12 + Math.random() * 0.22,
      yOffset: (Math.random() - 0.5) * 0.25,
      orbitSpeed: 0.6 + Math.random() * 0.8,
    },
    bobFrequency: 1.5 + Math.random() * 2.0,
    bobAmplitude: 0.03 + Math.random() * 0.06,
  }));
}

// ─── Opacity helper ───────────────────────────────────────────────────────────

/**
 * Writes opacity directly to the button DOM node, bypassing React state.
 * Skips only identical values to avoid redundant DOM writes on frames where
 * opacity hasn't changed (e.g. during the fully-opaque swarming phase).
 * Every distinct value is written so fades are smooth and continuous.
 */
function applyOpacity(
  next: number,
  runtime: ButterflyRuntime,
  btn: HTMLButtonElement | null
): void {
  const clamped = Math.max(0, Math.min(1, next));
  if (clamped === runtime.opacity) return;
  runtime.opacity = clamped;
  if (btn) btn.style.opacity = String(clamped);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DecorativeButterfliesProps {
  /** How many decorative butterflies to spawn. Default: 9 */
  count?: number;
  /** Milliseconds after mount before the swarm scatters. Default: 9000 */
  flyAwayAfterMs?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecorativeButterflies({
  count = 9,
  flyAwayAfterMs = 9000,
}: DecorativeButterfliesProps) {
  // Static per-butterfly config — created once, never changes
  const configs = useMemo(() => createButterflyConfigs(count), [count]);

  // All mutable per-butterfly animation data lives here.
  // A plain ref array — mutating fields inside the frame loop never triggers
  // a React re-render.
  const allRuntimes = useRef<ButterflyRuntime[]>(
    configs.map(createButterflyRuntime)
  );

  // groupRefs[i] → THREE.Group for configs[i], populated via ref callback in JSX
  const groupRefs = useRef<(THREE.Group | null)[]>(Array(count).fill(null));

  // buttonRefs[i] → <button> DOM node for configs[i].
  // Opacity is written here directly, bypassing React state entirely.
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>(
    Array(count).fill(null)
  );

  // The only piece of React state in this component. Incremented once per
  // butterfly at the very end of its fly-away, purely to remove its <group>
  // from the JSX tree.
  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  // ─── Fly-away trigger ─────────────────────────────────────────────────────
  // One outer timeout replaces the N useEffects that lived in the old
  // DecorativeButterflyInstance children. Each butterfly's individual stagger
  // (config.flyAwayDelay) is preserved via a nested per-butterfly setTimeout.

  useEffect(() => {
    const outerTimer = setTimeout(() => {
      allRuntimes.current.forEach((runtime) => {
        if (!runtime.active) return;

        const innerTimer = setTimeout(() => {
          const group = groupRefs.current[runtime.config.id];
          if (!group || !runtime.active) return;

          runtime.flyAwayOrigin = group.position.clone();
          runtime.flyAwayDestination = randomEscapeTarget(group.position);
          runtime.flyAwayElapsed = 0;
          runtime.currentPhase = "flyingAway";
          runtime.phaseElapsed = 0;
        }, runtime.config.flyAwayDelay * 1000); // ← per-butterfly stagger preserved

        // Stash timer id on the runtime object so the cleanup below can reach it
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

  // ─── Single frame loop ────────────────────────────────────────────────────
  // Replaces N independent useFrame subscriptions that lived in the old child
  // components. Each butterfly still advances through its own phase at its own
  // pace — per-butterfly config values (wave, wanderTarget, swarmSlot, etc.)
  // are read from runtime.config on every iteration.

  useFrame((_, delta) => {
    for (let i = 0; i < allRuntimes.current.length; i++) {
      const runtime = allRuntimes.current[i];
      if (!runtime.active) continue;

      const group = groupRefs.current[i];
      if (!group) continue;

      runtime.totalElapsed += delta;
      runtime.phaseElapsed += delta;

      const btn = buttonRefs.current[i];

      switch (runtime.currentPhase) {
        case "spawning": {
          const done = tickSpawning({
            group,
            phaseElapsed: runtime.phaseElapsed,
            spawnOrigin: runtime.spawnOrigin,
            wanderTarget: runtime.config.wanderTarget, // per-butterfly
            wave: runtime.config.wave, // per-butterfly
            setSmoothedOpacity: (next) => applyOpacity(next, runtime, btn),
          });
          if (done) {
            runtime.currentPhase = "wandering";
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case "wandering": {
          const done = tickWandering({
            group,
            phaseElapsed: runtime.phaseElapsed,
            wanderTarget: runtime.config.wanderTarget, // per-butterfly
            wave: runtime.config.wave, // per-butterfly
            setSmoothedOpacity: (next) => applyOpacity(next, runtime, btn),
          });
          if (done) {
            runtime.currentPhase = "gathering";
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case "gathering": {
          const done = tickGathering({
            group,
            phaseElapsed: runtime.phaseElapsed,
            wave: runtime.config.wave, // per-butterfly
          });
          if (done) {
            runtime.currentPhase = "swarming";
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case "swarming": {
          tickSwarming({
            group,
            phaseElapsed: runtime.phaseElapsed,
            totalElapsed: runtime.totalElapsed,
            swarmSlot: runtime.config.swarmSlot, // per-butterfly
            wave: runtime.config.wave, // per-butterfly
            bobFrequency: runtime.config.bobFrequency, // per-butterfly
            bobAmplitude: runtime.config.bobAmplitude, // per-butterfly
          });
          break;
        }

        case "flyingAway": {
          if (!runtime.flyAwayOrigin || !runtime.flyAwayDestination) break;
          runtime.flyAwayElapsed += delta;
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
              // Zero out scale immediately so the first rendered frame is
              // invisible. useFrame runs after the first render, so without
              // this the butterfly flashes at full size for one frame on mount.
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
                    // Zero opacity immediately for the same reason as scale above
                    if (el) el.style.opacity = "0";
                  },
                } as React.RefObject<HTMLButtonElement | null>
              }
            />
          </group>
        ))}
    </>
  );
}
