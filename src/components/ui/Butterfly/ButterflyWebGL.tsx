"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  DEG2RAD,
  UPPER_BIT_ROTZ,
  LOWER_BIT_ROTZ,
  BODY_ROTY,
  FLAP,
  BUTTERFLY_BASE_SCALE,
  DIMS,
  BORDER_OPACITY,
  INNER_Z_OFFSET,
  WING_INNER_OPACITY,
} from "../../../utils/constants";
import {
  getUpperOuterGeometry,
  getUpperInnerGeometry,
  getLowerOuterGeometry,
  getLowerInnerGeometry,
  getBodyGeometry,
  BODY_SCALE,
} from "./geometry";
import {
  getWingOuterMaterial,
  getBodyMaterial,
  getBorderMaterial,
} from "./materials";
import { easeFlap, flapPingPong, interpolateFlightPath } from "./animation";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButterflyWebGLProps {
  /** Average flap duration in ms (per-wing values averaged). */
  flapDurationMs: number;
  /** Mutable ref the parent writes to control opacity (0–1). */
  opacityRef: React.MutableRefObject<number>;
  /** Random time offset so butterflies don't flap/fly in sync. */
  timeOffset?: number;
}

// ─── Pivot offset ─────────────────────────────────────────────────────────────
const LEFT_HINGE_X = 0.08;

// ─── Base-pose rotation ───────────────────────────────────────────────────────
const BASE_POSE_RX = 50 * DEG2RAD;
const BASE_POSE_RY = 20 * DEG2RAD;
const BASE_POSE_RZ = -50 * DEG2RAD;

// ─── Border line helpers ──────────────────────────────────────────────────────

function createWingBorderPoints(w: number, h: number): THREE.Vector3[] {
  // Matches the bezier shape from geometry.ts but as discrete points for LineLoop
  const pts: THREE.Vector3[] = [];
  const steps = 24;

  // We trace the same path as createWingPetalShape in geometry.ts
  // Segment 1: top-left → top-right (cubic bezier)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cubicBez(-w, -w * 0.35, 0, 0, t);
    const y = cubicBez(h * 0.5, h * 0.5, h * 0.15, 0, t);
    pts.push(new THREE.Vector3(x, y, 0));
  }
  // Segment 2: right → bottom-right
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = cubicBez(0, 0, -w * 0.25, -w * 0.5, t);
    const y = cubicBez(0, -h * 0.15, -h * 0.5, -h * 0.5, t);
    pts.push(new THREE.Vector3(x, y, 0));
  }
  // Segment 3: bottom → bottom-left
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = cubicBez(-w * 0.5, -w * 0.75, -w, -w, t);
    const y = cubicBez(-h * 0.5, -h * 0.5, -h * 0.25, 0, t);
    pts.push(new THREE.Vector3(x, y, 0));
  }
  // Segment 4: left edge straight line back to start
  pts.push(new THREE.Vector3(-w, h * 0.5, 0));

  return pts;
}

function cubicBez(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

// ─── Cached border geometries ─────────────────────────────────────────────────

let _upperBorderGeo: THREE.BufferGeometry | null = null;
let _lowerBorderGeo: THREE.BufferGeometry | null = null;
let _upperInnerBorderGeo: THREE.BufferGeometry | null = null;
let _lowerInnerBorderGeo: THREE.BufferGeometry | null = null;

function getUpperBorderGeometry(): THREE.BufferGeometry {
  if (!_upperBorderGeo) {
    const pts = createWingBorderPoints(DIMS.upperOuter.w, DIMS.upperOuter.h);
    _upperBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
  }
  return _upperBorderGeo;
}

function getLowerBorderGeometry(): THREE.BufferGeometry {
  if (!_lowerBorderGeo) {
    const pts = createWingBorderPoints(DIMS.lowerOuter.w, DIMS.lowerOuter.h);
    _lowerBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
  }
  return _lowerBorderGeo;
}

function getUpperInnerBorderGeometry(): THREE.BufferGeometry {
  if (!_upperInnerBorderGeo) {
    const pts = createWingBorderPoints(DIMS.upperInner.w, DIMS.upperInner.h);
    _upperInnerBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
  }
  return _upperInnerBorderGeo;
}

function getLowerInnerBorderGeometry(): THREE.BufferGeometry {
  if (!_lowerInnerBorderGeo) {
    const pts = createWingBorderPoints(DIMS.lowerInner.w, DIMS.lowerInner.h);
    _lowerInnerBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
  }
  return _lowerInnerBorderGeo;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ButterflyWebGL({
  flapDurationMs,
  opacityRef,
  timeOffset = 0,
}: ButterflyWebGLProps) {
  // Refs for animated groups
  const rootRef = useRef<THREE.Group>(null!);
  const leftFlapRef = useRef<THREE.Group>(null!);
  const rightFlapRef = useRef<THREE.Group>(null!);

  // Shared geometries (module-level cache — zero allocation)
  const upperOuterGeo = getUpperOuterGeometry();
  const upperInnerGeo = getUpperInnerGeometry();
  const lowerOuterGeo = getLowerOuterGeometry();
  const lowerInnerGeo = getLowerInnerGeometry();
  const bodyGeo = getBodyGeometry();
  const upperBorderGeo = getUpperBorderGeometry();
  const lowerBorderGeo = getLowerBorderGeometry();
  const upperInnerBorderGeo = getUpperInnerBorderGeometry();
  const lowerInnerBorderGeo = getLowerInnerBorderGeometry();

  // Per-butterfly material clones (need independent opacity uniform)
  const wingMat = useMemo(() => getWingOuterMaterial().clone(), []);
  const wingInnerMat = useMemo(() => {
    const mat = getWingOuterMaterial().clone();
    mat.uniforms.uOpacity.value = WING_INNER_OPACITY;
    return mat;
  }, []);
  const bodyMat = useMemo(() => getBodyMaterial().clone(), []);
  const borderMat = useMemo(() => getBorderMaterial().clone(), []);

  // Track last opacity to avoid redundant uniform writes
  const lastOpacity = useRef(-1);

  // ─── Per-frame animation ──────────────────────────────────────────────────

  useFrame(() => {
    const elapsed = (performance.now() / 1000 + timeOffset) % 1000;

    // ── Flap ──────────────────────────────────────────────────────────────
    const t = easeFlap(flapPingPong(elapsed, flapDurationMs));

    if (leftFlapRef.current) {
      leftFlapRef.current.rotation.y = THREE.MathUtils.lerp(
        FLAP.left.from,
        FLAP.left.to,
        t
      );
    }
    if (rightFlapRef.current) {
      rightFlapRef.current.rotation.y = THREE.MathUtils.lerp(
        FLAP.right.from,
        FLAP.right.to,
        t
      );
    }

    // ── Flight path (local body sway) ─────────────────────────────────────
    const fp = interpolateFlightPath(elapsed);
    if (rootRef.current) {
      rootRef.current.rotation.set(fp.rx, fp.ry, fp.rz);
      rootRef.current.position.x = fp.tx;
      rootRef.current.position.y = fp.ty;
      rootRef.current.scale.set(
        fp.sx * BUTTERFLY_BASE_SCALE,
        BUTTERFLY_BASE_SCALE,
        BUTTERFLY_BASE_SCALE
      );
    }

    // ── Opacity ───────────────────────────────────────────────────────────
    const op = opacityRef.current;
    if (op !== lastOpacity.current) {
      lastOpacity.current = op;
      // Wing: CSS .wing { opacity: 0.85 } × phase opacity
      // Per-stop alpha is baked into the shader, uOpacity = element-level
      wingMat.uniforms.uOpacity.value = op * 0.85;
      wingInnerMat.uniforms.uOpacity.value = op * WING_INNER_OPACITY;
      bodyMat.uniforms.uOpacity.value = op;
      borderMat.opacity = op * BORDER_OPACITY;
    }
  });

  // ─── Wing sub-tree (reused for left & right) ─────────────────────────────

  const WingPetals = useMemo(
    () =>
      function WingPetals() {
        return (
          <>
            {/* Upper bit */}
            <group rotation={[0, 0, UPPER_BIT_ROTZ]}>
              {/* Outer surface + border */}
              <mesh geometry={upperOuterGeo} material={wingMat} />
              <lineLoop geometry={upperBorderGeo} material={borderMat} />
              {/* Inner overlay — CSS left:-30px top:5px */}
              <group position={[-0.3, -0.05, INNER_Z_OFFSET]}>
                <mesh geometry={upperInnerGeo} material={wingInnerMat} />
                <lineLoop geometry={upperInnerBorderGeo} material={borderMat} />
              </group>
            </group>

            {/* Lower bit */}
            <group rotation={[0, 0, LOWER_BIT_ROTZ]}>
              {/* Outer surface + border */}
              <mesh geometry={lowerOuterGeo} material={wingMat} />
              <lineLoop geometry={lowerBorderGeo} material={borderMat} />
              {/* Inner overlay — CSS left:-24px top:5px */}
              <group position={[-0.24, -0.05, INNER_Z_OFFSET]}>
                <mesh geometry={lowerInnerGeo} material={wingInnerMat} />
                <lineLoop geometry={lowerInnerBorderGeo} material={borderMat} />
              </group>
            </group>
          </>
        );
      },
    [
      upperOuterGeo,
      upperInnerGeo,
      lowerOuterGeo,
      lowerInnerGeo,
      upperBorderGeo,
      lowerBorderGeo,
      upperInnerBorderGeo,
      lowerInnerBorderGeo,
      wingMat,
      wingInnerMat,
      borderMat,
    ]
  );

  return (
    <group
      ref={rootRef}
      scale={[BUTTERFLY_BASE_SCALE, BUTTERFLY_BASE_SCALE, BUTTERFLY_BASE_SCALE]}
    >
      {/* Static base-pose tilt — replicates CSS rotateX(50) rotateY(20) rotateZ(-50) */}
      <group rotation={[BASE_POSE_RX, BASE_POSE_RY, BASE_POSE_RZ]}>
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
            <WingPetals />
          </group>
        </group>

        {/* ── Right wing hinge ───────────────────────────────────────────── */}
        <group position={[-LEFT_HINGE_X, 0, 0]}>
          <group ref={rightFlapRef} rotation={[0, FLAP.right.from, 0]}>
            <WingPetals />
          </group>
        </group>
      </group>
    </group>
  );
}
