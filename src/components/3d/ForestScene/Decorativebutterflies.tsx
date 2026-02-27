"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Butterfly from "../../ui/Butterfly/Butterfly";

// ─── Timing constants (seconds) ──────────────────────────────────────────────
const SPAWN_DURATION = 1.8; // fade-in + drift outward from center
const WANDER_DURATION = 2.5; // free individual S-wave flight
const GATHER_DURATION = 2.0; // curve toward the shared swarm center
// After gathering they swarm until flyAway fires (controlled by flyAwayAfterMs)

// Shared convergence point in world space
const SWARM_CENTER = new THREE.Vector3(0, 0.3, 0);

// Reusable vectors — never re-allocated per frame
const _tangent = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();
const _tmp = new THREE.Vector3();

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "spawning" | "wandering" | "gathering" | "swarming" | "flyingAway";

interface ButterflyData {
  id: number;
  wave: { amplitude: number; frequency: number; phase: number };
  flapDuration: { left: number; right: number };
  flyAwayDelay: number;
  wanderTarget: THREE.Vector3;
  swarmSlot: {
    angleOffset: number;
    radius: number;
    yOffset: number;
    speed: number;
  };
  bounceFreq: number;
  bounceAmp: number;
}

interface InstanceProps {
  data: ButterflyData;
  flyAway: boolean;
  onGone: (id: number) => void;
}

// ─── Single butterfly instance ───────────────────────────────────────────────

function DecorativeButterflyInstance({ data, flyAway, onGone }: InstanceProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(0);

  const phaseRef = useRef<Phase>("spawning");
  const elapsedRef = useRef(0);
  const phaseElapsedRef = useRef(0);
  const opacityRef = useRef(0);

  // Entry point: butterfly flies IN from outside the scene
  const spawnOriginRef = useRef(
    (() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 2;
      return new THREE.Vector3(
        Math.cos(angle) * dist,
        -0.5 + Math.random() * 1.0,
        Math.sin(angle) * dist
      );
    })()
  );

  const flyAwayStartRef = useRef<THREE.Vector3 | null>(null);
  const flyAwayTargetRef = useRef<THREE.Vector3 | null>(null);
  const flyAwayElapsed = useRef(0);
  const flyAwayDuration = useRef(1.4 + Math.random() * 0.8);

  useEffect(() => {
    if (!flyAway) return;
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      phaseRef.current = "flyingAway";
      phaseElapsedRef.current = 0;
      flyAwayElapsed.current = 0;
      flyAwayStartRef.current = groupRef.current.position.clone();
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 5;
      flyAwayTargetRef.current = new THREE.Vector3(
        groupRef.current.position.x + Math.cos(angle) * dist,
        groupRef.current.position.y + 2 + Math.random() * 3,
        groupRef.current.position.z + Math.sin(angle) * dist
      );
    }, data.flyAwayDelay * 1000);
    return () => clearTimeout(timer);
  }, [flyAway, data.flyAwayDelay]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || !visible) return;

    elapsedRef.current += delta;
    phaseElapsedRef.current += delta;
    const pe = phaseElapsedRef.current;

    const updateOpacity = (next: number) => {
      opacityRef.current = next;
      if (Math.abs(next - opacity) > 0.04)
        setOpacity(Math.max(0, Math.min(1, next)));
    };

    // ── SPAWNING ─────────────────────────────────────────────────────────────
    // Fly in from a far entry point with S-wave weave.
    // Scale: starts tiny (0.05) and grows to 1.
    // Opacity: fades in from 0 to 1.
    if (phaseRef.current === "spawning") {
      const rawT = Math.min(pe / SPAWN_DURATION, 1);
      const eased = rawT * rawT * (3 - 2 * rawT); // smooth-step for base travel

      // Base position: lerp from far entry to wander target
      _tmp.lerpVectors(spawnOriginRef.current, data.wanderTarget, eased);

      // S-wave perpendicular to the travel direction
      // Envelope = sin(πt) so weave starts at 0 and lands cleanly at wanderTarget
      _tangent
        .subVectors(data.wanderTarget, spawnOriginRef.current)
        .normalize();
      _right.crossVectors(_tangent, _up).normalize();
      const envelope = Math.sin(rawT * Math.PI);
      const sineOffset =
        Math.sin(rawT * Math.PI * 2 * data.wave.frequency + data.wave.phase) *
        data.wave.amplitude *
        envelope;

      group.position.copy(_tmp).addScaledVector(_right, sineOffset);
      group.position.y +=
        Math.cos(rawT * Math.PI * 2 * data.wave.frequency + data.wave.phase) *
        data.wave.amplitude *
        0.4 *
        envelope;

      // Scale: grow from tiny to full size using a cubic ease
      group.scale.setScalar(0.05 + eased * 0.95);

      // Opacity: fade in
      updateOpacity(eased);

      if (rawT >= 1) {
        phaseRef.current = "wandering";
        phaseElapsedRef.current = 0;
      }
      return;
    }

    // ── WANDERING ────────────────────────────────────────────────────────────
    if (phaseRef.current === "wandering") {
      const orbitAngle = pe * 1.1 + data.wave.phase;
      const orbitR = 0.28 + Math.sin(pe * 0.6 + data.wave.phase) * 0.12;
      group.position.set(
        data.wanderTarget.x + Math.cos(orbitAngle) * orbitR,
        data.wanderTarget.y +
          Math.sin(pe * data.wave.frequency + data.wave.phase) *
            data.wave.amplitude *
            0.5,
        data.wanderTarget.z + Math.sin(orbitAngle) * orbitR
      );
      updateOpacity(1);
      if (pe >= WANDER_DURATION) {
        phaseRef.current = "gathering";
        phaseElapsedRef.current = 0;
      }
      return;
    }

    // ── GATHERING ────────────────────────────────────────────────────────────
    if (phaseRef.current === "gathering") {
      const rawT = Math.min(pe / GATHER_DURATION, 1);
      const eased = rawT * rawT * (3 - 2 * rawT);
      _tmp.lerpVectors(group.position, SWARM_CENTER, eased);
      _tangent.subVectors(SWARM_CENTER, group.position).normalize();
      _right.crossVectors(_tangent, _up).normalize();
      const envelope = Math.sin(rawT * Math.PI);
      const sineOffset =
        Math.sin(rawT * Math.PI * 2 * data.wave.frequency + data.wave.phase) *
        data.wave.amplitude *
        envelope;
      group.position.copy(_tmp).addScaledVector(_right, sineOffset);
      group.position.y +=
        Math.cos(rawT * Math.PI * 2 * data.wave.frequency + data.wave.phase) *
        data.wave.amplitude *
        0.4 *
        envelope;
      if (rawT >= 1) {
        phaseRef.current = "swarming";
        phaseElapsedRef.current = 0;
      }
      return;
    }

    // ── SWARMING ─────────────────────────────────────────────────────────────
    if (phaseRef.current === "swarming") {
      const { angleOffset, radius, yOffset, speed } = data.swarmSlot;
      const angle = pe * speed + angleOffset;
      group.position.x = SWARM_CENTER.x + Math.cos(angle) * radius;
      group.position.z = SWARM_CENTER.z + Math.sin(angle) * radius;
      group.position.y =
        SWARM_CENTER.y +
        yOffset +
        Math.sin(elapsedRef.current * data.bounceFreq + data.wave.phase) *
          data.bounceAmp;
      const driftAmp = data.wave.amplitude * 0.2;
      group.position.x +=
        Math.sin(
          elapsedRef.current * data.wave.frequency * 0.5 + data.wave.phase
        ) * driftAmp;
      group.position.z +=
        Math.cos(
          elapsedRef.current * data.wave.frequency * 0.5 + data.wave.phase
        ) * driftAmp;
      return;
    }

    // ── FLYING AWAY ──────────────────────────────────────────────────────────
    if (phaseRef.current === "flyingAway") {
      if (!flyAwayStartRef.current || !flyAwayTargetRef.current) return;
      flyAwayElapsed.current += delta;
      const rawT = Math.min(
        flyAwayElapsed.current / flyAwayDuration.current,
        1
      );
      const eased = rawT * rawT;
      group.position.lerpVectors(
        flyAwayStartRef.current,
        flyAwayTargetRef.current,
        eased
      );
      _tangent
        .subVectors(flyAwayTargetRef.current, flyAwayStartRef.current)
        .normalize();
      _right.crossVectors(_tangent, _up).normalize();
      const envelope = Math.sin(rawT * Math.PI);
      const sineOffset =
        Math.sin(rawT * Math.PI * 2 * data.wave.frequency + data.wave.phase) *
        data.wave.amplitude *
        1.4 *
        envelope;
      group.position.addScaledVector(_right, sineOffset);
      group.position.y +=
        Math.cos(rawT * Math.PI * 2 * data.wave.frequency + data.wave.phase) *
        data.wave.amplitude *
        0.5 *
        envelope;
      updateOpacity(1 - eased);
      if (rawT >= 1) {
        setVisible(false);
        onGone(data.id);
      }
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
  /** Number of decorative butterflies. Default: 9 */
  count?: number;
  /**
   * Ms after mount before the swarm scatters.
   * Default: 9000  (spawn 1.8 + wander 2.5 + gather 2.0 + swarm 2.5 ≈ 8.8s)
   */
  flyAwayAfterMs?: number;
}

export default function DecorativeButterflies({
  count = 9,
  flyAwayAfterMs = 9000,
}: DecorativeButterfliesProps) {
  const [flyAway, setFlyAway] = useState(false);
  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  const butterflies = useMemo<ButterflyData[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        wave: {
          amplitude: 0.18 + Math.random() * 0.22,
          frequency: 1.5 + Math.random() * 1.0,
          phase: Math.random() * Math.PI * 2,
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
          radius: 0.12 + Math.random() * 0.22,
          yOffset: (Math.random() - 0.5) * 0.25,
          speed: 0.6 + Math.random() * 0.8,
        },
        bounceFreq: 1.5 + Math.random() * 2.0,
        bounceAmp: 0.03 + Math.random() * 0.06,
      })),
    [count]
  );

  useEffect(() => {
    const t = setTimeout(() => setFlyAway(true), flyAwayAfterMs);
    return () => clearTimeout(t);
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
