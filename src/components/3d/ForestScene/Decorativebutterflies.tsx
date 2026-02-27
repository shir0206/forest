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

interface ButterflyData {
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

interface InstanceProps {
  data: ButterflyData;
  flyAway: boolean;
  onGone: (id: number) => void;
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
  group.scale.setScalar(0.005 + easedProgress * 0.95);
  setSmoothedOpacity(easedProgress);

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

// ─── Single butterfly instance ───────────────────────────────────────────────

function DecorativeButterflyInstance({ data, flyAway, onGone }: InstanceProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(0);

  const phase = useRef<Phase>("spawning");
  const totalElapsed = useRef(0);
  const phaseElapsed = useRef(0);
  const currentOpacity = useRef(0);

  const spawnOrigin = useRef(randomSpawnOrigin());

  const flyAwayStart = useRef<THREE.Vector3 | null>(null);
  const flyAwayTarget = useRef<THREE.Vector3 | null>(null);
  const flyAwayElapsed = useRef(0);
  const flyAwayDuration = useRef(1.4 + Math.random() * 0.8);

  function setSmoothedOpacity(next: number) {
    const clamped = Math.max(0, Math.min(1, next));
    currentOpacity.current = clamped;
    // Only trigger a React re-render when the change would be visible
    if (Math.abs(clamped - opacity) > 0.04) setOpacity(clamped);
  }

  function advanceToPhase(nextPhase: Phase) {
    phase.current = nextPhase;
    phaseElapsed.current = 0;
  }

  useEffect(() => {
    if (!flyAway) return;

    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      flyAwayStart.current = groupRef.current.position.clone();
      flyAwayTarget.current = randomEscapeTarget(groupRef.current.position);
      flyAwayElapsed.current = 0;
      advanceToPhase("flyingAway");
    }, data.flyAwayDelay * 1000);

    return () => clearTimeout(timer);
  }, [flyAway, data.flyAwayDelay]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || !visible) return;

    totalElapsed.current += delta;
    phaseElapsed.current += delta;

    if (phase.current === "spawning") {
      const done = tickSpawning({
        group,
        phaseElapsed: phaseElapsed.current,
        spawnOrigin: spawnOrigin.current,
        wanderTarget: data.wanderTarget,
        wave: data.wave,
        setSmoothedOpacity,
      });
      if (done) advanceToPhase("wandering");
      return;
    }

    if (phase.current === "wandering") {
      const done = tickWandering({
        group,
        phaseElapsed: phaseElapsed.current,
        wanderTarget: data.wanderTarget,
        wave: data.wave,
        setSmoothedOpacity,
      });
      if (done) advanceToPhase("gathering");
      return;
    }

    if (phase.current === "gathering") {
      const done = tickGathering({
        group,
        phaseElapsed: phaseElapsed.current,
        wave: data.wave,
      });
      if (done) advanceToPhase("swarming");
      return;
    }

    if (phase.current === "swarming") {
      tickSwarming({
        group,
        phaseElapsed: phaseElapsed.current,
        totalElapsed: totalElapsed.current,
        swarmSlot: data.swarmSlot,
        wave: data.wave,
        bobFrequency: data.bobFrequency,
        bobAmplitude: data.bobAmplitude,
      });
      return;
    }

    if (phase.current === "flyingAway") {
      if (!flyAwayStart.current || !flyAwayTarget.current) return;
      flyAwayElapsed.current += delta;
      tickFlyingAway({
        group,
        flyAwayElapsed: flyAwayElapsed.current,
        flyAwayDuration: flyAwayDuration.current,
        flyAwayStart: flyAwayStart.current,
        flyAwayTarget: flyAwayTarget.current,
        wave: data.wave,
        setSmoothedOpacity,
        onComplete: () => {
          setVisible(false);
          onGone(data.id);
        },
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <Butterfly
        position={[0, 0, 0]}
        decorative
        flapDuration={data.flapDuration}
        opacity={opacity}
      />
    </group>
  );
}

// ─── Parent orchestrator ─────────────────────────────────────────────────────

interface DecorativeButterfliesProps {
  /** How many decorative butterflies to spawn. Default: 9 */
  count?: number;
  /** Milliseconds after mount before the swarm scatters. Default: 9000 */
  flyAwayAfterMs?: number;
}

function createButterflyData(count: number): ButterflyData[] {
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

export default function DecorativeButterflies({
  count = 9,
  flyAwayAfterMs = 9000,
}: DecorativeButterfliesProps) {
  const [flyAway, setFlyAway] = useState(false);
  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  const butterflies = useMemo(() => createButterflyData(count), [count]);

  useEffect(() => {
    const timer = setTimeout(() => setFlyAway(true), flyAwayAfterMs);
    return () => clearTimeout(timer);
  }, [flyAwayAfterMs]);

  const handleGone = (id: number) =>
    setGoneIds((prev) => new Set(prev).add(id));

  if (goneIds.size >= count) return null;

  return (
    <>
      {butterflies
        .filter((b) => !goneIds.has(b.id))
        .map((b) => (
          <DecorativeButterflyInstance
            key={b.id}
            data={b}
            flyAway={flyAway}
            onGone={handleGone}
          />
        ))}
    </>
  );
}
