"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE_ANIMATION_POSITIONS } from "../../../config/3d";

/** Total intro travel duration in seconds – should match camera intro */
const INTRO_DURATION = 3.2;

// Reusable vectors to avoid per-frame allocations
const _tangent = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();
const _curvePoint = new THREE.Vector3();

/**
 * A single decorative (non-interactive) butterfly with HTML/CSS animation
 */
function DecorativeWing() {
  return (
    <div className="wing">
      <div className="bit" />
      <div className="bit" />
    </div>
  );
}

interface DecorativeButterflyProps {
  id: number;
  /** Whether this butterfly should now fly away off-screen */
  flyAway: boolean;
  /** Random offset so each butterfly has a unique path */
  offset: { x: number; y: number; z: number };
  /** Per-butterfly S-wave parameters so each one weaves differently */
  wave: { amplitude: number; frequency: number; phase: number };
  /** Wing flap speed: base duration in ms for the CSS animation */
  flapDuration: { left: number; right: number };
  /** Delay before flying away (stagger) */
  flyAwayDelay: number;
  /** Startup delay in seconds before the butterfly begins moving */
  startDelay: number;
  /** Called when the fly-away animation completes so we can unmount */
  onGone: (id: number) => void;
}

function DecorativeButterflyInstance({
  id,
  flyAway,
  offset,
  wave,
  flapDuration,
  flyAwayDelay,
  startDelay,
  onGone,
}: DecorativeButterflyProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [visible, setVisible] = useState(true);

  /**
   * State machine refs (mutated in useFrame, never trigger re-renders):
   *   phase: "waiting" → "travelling" → "hovering" → "flyingAway" → done
   */
  const stateRef = useRef<"waiting" | "travelling" | "hovering" | "flyingAway">(
    "waiting"
  );
  const elapsedRef = useRef(0); // seconds since mount
  const flyAwayStartRef = useRef<THREE.Vector3 | null>(null);
  const flyAwayTargetRef = useRef<THREE.Vector3 | null>(null);
  const flyAwayElapsedRef = useRef(0);
  const flyAwayDurationRef = useRef(1.4 + Math.random() * 0.8);

  // Build a CatmullRom spline from scene positions + per-butterfly offset
  const curve = useMemo(() => {
    const pts = SCENE_ANIMATION_POSITIONS.map(
      (p: [number, number, number]) =>
        new THREE.Vector3(p[0] + offset.x, p[1] + offset.y, p[2] + offset.z)
    );
    return new THREE.CatmullRomCurve3(pts);
  }, [offset]);

  // When flyAway flag flips, transition to the flyingAway phase
  useEffect(() => {
    if (!flyAway) return;
    const delayTimer = setTimeout(() => {
      if (!groupRef.current) return;
      stateRef.current = "flyingAway";
      flyAwayStartRef.current = groupRef.current.position.clone();
      flyAwayElapsedRef.current = 0;

      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 6;
      flyAwayTargetRef.current = new THREE.Vector3(
        groupRef.current.position.x + Math.cos(angle) * dist,
        groupRef.current.position.y + 2 + Math.random() * 4,
        groupRef.current.position.z + Math.sin(angle) * dist
      );
    }, flyAwayDelay * 1000);

    return () => clearTimeout(delayTimer);
  }, [flyAway, flyAwayDelay]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || !visible) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    // ── WAITING ──────────────────────────────────────────────────────────────
    if (stateRef.current === "waiting") {
      // Place at curve start so it doesn't sit at origin
      curve.getPoint(0, _curvePoint);
      group.position.copy(_curvePoint);
      if (elapsed >= startDelay) {
        stateRef.current = "travelling";
      }
      return;
    }

    // ── TRAVELLING (intro path + S-wave weave) ───────────────────────────────
    if (stateRef.current === "travelling") {
      const travelElapsed = elapsed - startDelay;
      // Ease-in-out: t goes 0→1 over INTRO_DURATION
      const rawT = Math.min(travelElapsed / INTRO_DURATION, 1);
      // Smooth-step easing (matches power1.inOut feel)
      const t = rawT * rawT * (3 - 2 * rawT);

      // Base position on the spline
      curve.getPoint(t, _curvePoint);

      // S-wave: oscillate perpendicular to the curve tangent (the "right" axis)
      if (t > 0 && t < 1) {
        curve.getTangent(t, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();
        const sineOffset =
          Math.sin(t * Math.PI * 2 * wave.frequency + wave.phase) *
          wave.amplitude;
        _curvePoint.addScaledVector(_right, sineOffset);
        // Also a gentle vertical bob (half amplitude)
        _curvePoint.y +=
          Math.cos(t * Math.PI * 2 * wave.frequency + wave.phase) *
          wave.amplitude *
          0.4;
      }

      group.position.copy(_curvePoint);

      if (rawT >= 1) {
        stateRef.current = "hovering";
      }
      return;
    }

    // ── HOVERING (gentle float in place after intro) ──────────────────────────
    if (stateRef.current === "hovering") {
      // Soft vertical sine hover
      group.position.y += Math.sin(elapsed * 1.8) * 0.0008;
      return;
    }

    // ── FLYING AWAY (S-wave weave along escape vector) ───────────────────────
    if (stateRef.current === "flyingAway") {
      if (!flyAwayStartRef.current || !flyAwayTargetRef.current) return;

      flyAwayElapsedRef.current += delta;
      const t = Math.min(
        flyAwayElapsedRef.current / flyAwayDurationRef.current,
        1
      );

      // Ease-in acceleration along the escape path
      const eased = t * t;
      group.position.lerpVectors(
        flyAwayStartRef.current,
        flyAwayTargetRef.current,
        eased
      );

      // S-wave perpendicular to the escape direction.
      // Envelope = sin(πt) so the weave starts at 0, peaks mid-flight, and
      // fades back to 0 at arrival — butterfly reaches its exit point cleanly.
      _tangent
        .subVectors(flyAwayTargetRef.current, flyAwayStartRef.current)
        .normalize();
      _right.crossVectors(_tangent, _up).normalize();

      const envelope = Math.sin(t * Math.PI); // 0 → 1 → 0
      const sineOffset =
        Math.sin(t * Math.PI * 2 * wave.frequency + wave.phase) *
        wave.amplitude *
        1.4 * // slightly wider weave than during the intro
        envelope;

      group.position.addScaledVector(_right, sineOffset);
      // gentle vertical component so the weave is truly 3-D
      group.position.y +=
        Math.cos(t * Math.PI * 2 * wave.frequency + wave.phase) *
        wave.amplitude *
        0.5 *
        envelope;

      if (t >= 1) {
        setVisible(false);
        onGone(id);
      }
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <Html
        center
        wrapperClass="butterfly-container"
        distanceFactor={2}
        scale={[0.004, 0.004, 0.004]}
      >
        <div
          className="butterfly-button"
          style={{ pointerEvents: "none", opacity: 0.85 }}
          aria-hidden="true"
        >
          <div className="butterfly">
            {/* Each wing gets its own --flap-duration so they flutter independently */}
            <div
              className="wing"
              style={
                {
                  "--flap-duration": `${flapDuration.left}ms`,
                } as React.CSSProperties
              }
            >
              <div className="bit" />
              <div className="bit" />
            </div>
            <div
              className="wing"
              style={
                {
                  "--flap-duration": `${flapDuration.right}ms`,
                } as React.CSSProperties
              }
            >
              <div className="bit" />
              <div className="bit" />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------

interface DecorativeButterfliesProps {
  /**
   * How many extra butterflies to show during the intro.
   * Default: 8
   */
  count?: number;
  /**
   * How long after mount (ms) before the swarm flies away.
   * Should be roughly: intro animation duration + a little dwell time.
   * Default: 4500
   */
  flyAwayAfterMs?: number;
}

/**
 * Renders a swarm of decorative butterflies that follow the scene intro path
 * with an S-shaped weaving motion, then scatter off-screen leaving only the
 * real interactive butterfly behind.
 */
export default function DecorativeButterflies({
  count = 8,
  flyAwayAfterMs = 4500,
}: DecorativeButterfliesProps) {
  const [flyAway, setFlyAway] = useState(false);
  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  // Random per-butterfly data, stable across renders
  const butterflies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        offset: {
          x: (Math.random() - 0.5) * 1.4,
          y: (Math.random() - 0.5) * 0.6,
          z: (Math.random() - 0.5) * 1.4,
        },
        // S-wave: each butterfly gets its own amplitude, frequency & phase
        // so no two butterflies trace the exact same wiggle
        wave: {
          amplitude: 0.18 + Math.random() * 0.22, // how wide the S swings
          frequency: 1.5 + Math.random() * 1.0, // how many S cycles across the path
          phase: Math.random() * Math.PI * 2, // where in the cycle it starts
        },
        // Each wing flaps at its own random rhythm (80–220ms per cycle)
        flapDuration: {
          left: 80 + Math.random() * 140,
          right: 80 + Math.random() * 140,
        },
        flyAwayDelay: i * 0.12 + Math.random() * 0.2,
        startDelay: 0.15 + Math.random() * 0.35, // slight stagger so they don't all start together
      })),
    [count]
  );

  // Trigger fly-away after the configured delay
  useEffect(() => {
    const timer = setTimeout(() => setFlyAway(true), flyAwayAfterMs);
    return () => clearTimeout(timer);
  }, [flyAwayAfterMs]);

  const handleGone = (id: number) => {
    setGoneIds((prev) => new Set(prev).add(id));
  };

  // Fully unmount once every butterfly has gone
  if (goneIds.size >= count) return null;

  return (
    <>
      {butterflies
        .filter((b) => !goneIds.has(b.id))
        .map((b) => (
          <DecorativeButterflyInstance
            key={b.id}
            id={b.id}
            flyAway={flyAway}
            offset={b.offset}
            wave={b.wave}
            flapDuration={b.flapDuration}
            flyAwayDelay={b.flyAwayDelay}
            startDelay={b.startDelay}
            onGone={handleGone}
          />
        ))}
    </>
  );
}
