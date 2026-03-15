import * as THREE from "three";
import { DIMS } from "../../../utils/constants";

// ─── Wing petal shape ────────────────────────────────────────────────────────
//
// Approximates the CSS `border-radius: 0% 100% 50% 50% / 0% 50% 50% 100%`
// using quadratic Bézier curves.  The shape is in the XY plane with origin at
// the right edge (transform-origin: 100% 50% in CSS).
//
// Co-ordinate convention:
//   x: 0 = right edge (hinge),  -w = left edge (tip)
//   y: 0 = vertical centre

function createWingPetalShape(w: number, h: number): THREE.Shape {
  const shape = new THREE.Shape();

  // CSS border-radius: 0% 100% 50% 50% / 0% 50% 50% 100%
  //
  // Co-ordinate convention (matches geometry.ts):
  //   x: 0 = hinge (right edge),  -w = wing tip (left)
  //   y: -h/2 = bottom,  +h/2 = top
  //
  // The CSS shape has:
  //   top-left:     0% / 0%   → sharp corner
  //   top-right:  100% / 50%  → fully rounded
  //   bottom-right: 50% / 50% → moderate round
  //   bottom-left:  50% / 100% → wide round at bottom

  // Start at top-left (sharp corner)
  shape.moveTo(-w, h * 0.5);

  // Top edge → top-right: fully rounded (100%/50%)
  // cp2 close to endpoint → body-side edge is nearly straight/linear
  shape.bezierCurveTo(
    -w * 0.35,
    h * 0.5, // cp1: pull right along top edge
    0,
    h * 0.15, // cp2: approach hinge steeply (straight body edge)
    0,
    0 // end at hinge mid-height
  );

  // Right edge → bottom-right: moderate round (50%/50%)
  // cp1 close to start → body-side stays linear before curving out
  shape.bezierCurveTo(
    0,
    -h * 0.15, // cp1: leave hinge steeply (straight body edge)
    -w * 0.25,
    -h * 0.5, // cp2: approach bottom-right
    -w * 0.5,
    -h * 0.5 // end at bottom midpoint
  );

  // Bottom edge → bottom-left: wide round (50%/100%)
  shape.bezierCurveTo(
    -w * 0.75,
    -h * 0.5, // cp1: continue along bottom
    -w,
    -h * 0.25, // cp2: sweep up toward left edge
    -w,
    0 // end at left mid-height
  );

  // Left edge → top-left: straight (0%/0% radius)
  shape.lineTo(-w, h * 0.5);

  return shape;
}

// ─── UV normalisation ────────────────────────────────────────────────────────
//
// THREE.ShapeGeometry uses raw shape coordinates as UVs.  Our wing shapes have
// x in [-w, 0] and y in [-h/2, h/2], so the UVs are NOT in the 0–1 range the
// gradient shader expects.  This helper remaps them.

function normalizeUVs(geo: THREE.ShapeGeometry): void {
  const uv = geo.attributes.uv;
  if (!uv) return;

  let minU = Infinity,
    maxU = -Infinity;
  let minV = Infinity,
    maxV = -Infinity;

  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }

  const rangeU = maxU - minU || 1;
  const rangeV = maxV - minV || 1;

  for (let i = 0; i < uv.count; i++) {
    uv.setX(i, (uv.getX(i) - minU) / rangeU);
    uv.setY(i, (uv.getY(i) - minV) / rangeV);
  }

  uv.needsUpdate = true;
}

// ─── Cached geometry instances (shared across all butterflies) ───────────────

const CURVE_SEGMENTS = 8;

let _upperOuter: THREE.ShapeGeometry | null = null;
let _upperInner: THREE.ShapeGeometry | null = null;
let _lowerOuter: THREE.ShapeGeometry | null = null;
let _lowerInner: THREE.ShapeGeometry | null = null;
let _body: THREE.SphereGeometry | null = null;

export function getUpperOuterGeometry(): THREE.ShapeGeometry {
  if (!_upperOuter) {
    const shape = createWingPetalShape(DIMS.upperOuter.w, DIMS.upperOuter.h);
    _upperOuter = new THREE.ShapeGeometry(shape, CURVE_SEGMENTS);
    normalizeUVs(_upperOuter);
  }
  return _upperOuter;
}

export function getUpperInnerGeometry(): THREE.ShapeGeometry {
  if (!_upperInner) {
    const shape = createWingPetalShape(DIMS.upperInner.w, DIMS.upperInner.h);
    _upperInner = new THREE.ShapeGeometry(shape, CURVE_SEGMENTS);
    normalizeUVs(_upperInner);
  }
  return _upperInner;
}

export function getLowerOuterGeometry(): THREE.ShapeGeometry {
  if (!_lowerOuter) {
    const shape = createWingPetalShape(DIMS.lowerOuter.w, DIMS.lowerOuter.h);
    _lowerOuter = new THREE.ShapeGeometry(shape, CURVE_SEGMENTS);
    normalizeUVs(_lowerOuter);
  }
  return _lowerOuter;
}

export function getLowerInnerGeometry(): THREE.ShapeGeometry {
  if (!_lowerInner) {
    const shape = createWingPetalShape(DIMS.lowerInner.w, DIMS.lowerInner.h);
    _lowerInner = new THREE.ShapeGeometry(shape, CURVE_SEGMENTS);
    normalizeUVs(_lowerInner);
  }
  return _lowerInner;
}

/**
 * Body — elongated ellipsoid via a scaled sphere.
 * CSS: 20×110 px  →  world 0.2 × 1.1
 * We use a SphereGeometry with radius 1, then scale on the group.
 */
export function getBodyGeometry(): THREE.SphereGeometry {
  if (!_body) {
    _body = new THREE.SphereGeometry(1, 8, 6);
  }
  return _body;
}

/** Body scale vector to turn the unit sphere into the correct ellipsoid. */
export const BODY_SCALE = new THREE.Vector3(
  DIMS.body.radius,
  DIMS.body.halfHeight,
  DIMS.body.radius
);
