"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import {
  easeFlap,
  flapPingPong,
  interpolateFlightPath,
} from "../../core/animation";
import {
  ANIMATION_TIME_SCALE,
  BODY_ROTY,
  BORDER_OPACITY,
  BUTTERFLY_BASE_SCALE,
  DEG2RAD,
  FLAP,
  WING_INNER_OPACITY,
} from "../../core/constants";
import { BODY_SCALE, getBodyGeometry } from "../../core/geometry";
import {
  getBodyMaterial,
  getBorderMaterial,
  getWingOuterMaterial,
} from "../../core/materials";
import WingMesh from "./WingMesh";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButterflyWebGLProps {
  /** Average flap duration in ms (per-wing values averaged). Must be > 0. */
  flapDurationMs: number;
  /** Mutable ref the parent writes to control opacity (0–1). */
  opacityRef: React.MutableRefObject<number>;
  /** Random time offset so butterflies don't flap/fly in sync. */
  timeOffset?: number;
  /** Optional callback when butterfly completes animation cycle */
  onAnimationCycle?: () => void;
  /** Performance mode for mobile devices */
  lowPerformanceMode?: boolean;
  /** Flip each wing petal 180° on its local Y axis (shows backface). */
  flipPetals?: boolean;
  /** Apply negative X scale from flight-path keyframes (CSS compat). Default: true. */
  mirrorX?: boolean;
  /** Use gentle tilt for billboard-oriented decorative butterflies. Default: false. */
  useDecorativePose?: boolean;
}

// ─── Pivot offset ─────────────────────────────────────────────────────────────
const LEFT_HINGE_X = 0.08;

// ─── Base-pose rotation ───────────────────────────────────────────────────────
const BASE_POSE_RX = -80 * DEG2RAD;
const BASE_POSE_RY = 55 * DEG2RAD;
const BASE_POSE_RZ = -10 * DEG2RAD;

// ─── Decorative base-pose — gentle tilt for billboard-oriented butterflies ───
const DECORATIVE_POSE_RX = 68 * DEG2RAD;
const DECORATIVE_POSE_RY = 55 * DEG2RAD;
const DECORATIVE_POSE_RZ = -30 * DEG2RAD;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ButterflyWebGL({
  flapDurationMs,
  opacityRef,
  timeOffset = 0,
  onAnimationCycle,
  lowPerformanceMode = false,
  flipPetals = false,
  mirrorX = true,
  useDecorativePose = false,
}: ButterflyWebGLProps): React.JSX.Element {
  // Input validation
  if (flapDurationMs <= 0) {
    console.warn(
      "ButterflyWebGL: flapDurationMs must be positive, using default 300ms"
    );
    flapDurationMs = 300;
  }

  // Refs for animated groups
  const rootRef = useRef<THREE.Group>(null!);
  const leftFlapRef = useRef<THREE.Group>(null!);
  const rightFlapRef = useRef<THREE.Group>(null!);

  // Body geometry and material
  const bodyGeo = getBodyGeometry();
  const bodyMat = getBodyMaterial().clone();

  // Wing materials for opacity tracking
  const wingMat = getWingOuterMaterial().clone();
  const wingInnerMat = (() => {
    const mat = getWingOuterMaterial().clone();
    mat.uniforms.uOpacity.value = WING_INNER_OPACITY;
    return mat;
  })();
  const borderMat = getBorderMaterial().clone();

  // Track last opacity to avoid redundant uniform writes
  const lastOpacity = useRef(-1);
  const lastAnimationCycle = useRef(-1);

  // Performance optimizations for low-end devices
  const animationSteps = lowPerformanceMode ? 12 : 24;

  // ─── Per-frame animation ──────────────────────────────────────────────────

  useFrame(() => {
    const elapsed =
      ((performance.now() / 1000 + timeOffset) * ANIMATION_TIME_SCALE) % 1000;

    // ── Animation cycle callback ─────────────────────────────────────────
    if (onAnimationCycle) {
      const currentCycle = Math.floor(elapsed / (flapDurationMs / 1000));
      if (currentCycle !== lastAnimationCycle.current) {
        lastAnimationCycle.current = currentCycle;
        onAnimationCycle();
      }
    }

    // ── Flap (with performance optimization) ─────────────────────────────
    const flapT = lowPerformanceMode
      ? Math.round(
          easeFlap(flapPingPong(elapsed, flapDurationMs)) * animationSteps
        ) / animationSteps
      : easeFlap(flapPingPong(elapsed, flapDurationMs));

    if (leftFlapRef.current) {
      leftFlapRef.current.rotation.y = THREE.MathUtils.lerp(
        FLAP.left.from,
        FLAP.left.to,
        flapT
      );
    }
    if (rightFlapRef.current) {
      rightFlapRef.current.rotation.y = THREE.MathUtils.lerp(
        FLAP.right.from,
        FLAP.right.to,
        flapT
      );
    }

    // ── Flight path (local body sway) ─────────────────────────────────────
    const fp = interpolateFlightPath(elapsed);
    if (rootRef.current) {
      rootRef.current.rotation.set(fp.rx, fp.ry, fp.rz);
      rootRef.current.position.x = fp.tx;
      rootRef.current.position.y = fp.ty;
      const effectiveSx = mirrorX ? fp.sx : Math.abs(fp.sx);
      rootRef.current.scale.set(
        effectiveSx * BUTTERFLY_BASE_SCALE,
        BUTTERFLY_BASE_SCALE,
        BUTTERFLY_BASE_SCALE
      );
    }

    // ── Opacity ───────────────────────────────────────────────────────────
    const op = opacityRef.current;
    if (op !== lastOpacity.current) {
      lastOpacity.current = op;
      wingMat.uniforms.uOpacity.value = op * 0.85;
      wingInnerMat.uniforms.uOpacity.value = op * WING_INNER_OPACITY;
      bodyMat.uniforms.uOpacity.value = op;
      borderMat.opacity = op * BORDER_OPACITY;
    }
  });

  const poseRX = useDecorativePose ? DECORATIVE_POSE_RX : BASE_POSE_RX;
  const poseRY = useDecorativePose ? DECORATIVE_POSE_RY : BASE_POSE_RY;
  const poseRZ = useDecorativePose ? DECORATIVE_POSE_RZ : BASE_POSE_RZ;

  return (
    <group
      ref={rootRef}
      scale={[BUTTERFLY_BASE_SCALE, BUTTERFLY_BASE_SCALE, BUTTERFLY_BASE_SCALE]}
    >
      {/* Static base-pose tilt — CSS pose or gentle decorative tilt */}
      <group rotation={[poseRX, poseRY, poseRZ]}>
        {/* ── Body ───────────────────────────────────────────────────────── */}
        <mesh
          geometry={bodyGeo}
          material={bodyMat}
          scale={BODY_SCALE}
          rotation={[0, BODY_ROTY, 0]}
        />

        {/* ── Left wing hinge ────────────────────────────────────────────── */}
        <group position={[LEFT_HINGE_X, 0, 0]}>
          <group ref={leftFlapRef} rotation={[0, FLAP.left.from, 0]}>
            <WingMesh flipPetals={flipPetals} />
          </group>
        </group>

        {/* ── Right wing hinge ───────────────────────────────────────────── */}
        <group position={[-LEFT_HINGE_X, 0, 0]}>
          <group ref={rightFlapRef} rotation={[0, FLAP.right.from, 0]}>
            <WingMesh flipPetals={flipPetals} />
          </group>
        </group>
      </group>
    </group>
  );
}
