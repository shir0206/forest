import * as THREE from "three";

// ─── Conversion ──────────────────────────────────────────────────────────────

export const DEG2RAD = THREE.MathUtils.DEG2RAD;

/**
 * CSS-px → Three.js world-unit scale factor.
 * Used for geometry dimensions (wing width, body size, etc.).
 */
export const PX_TO_WORLD = 0.01;

/**
 * Separate scale for flight-path translations (tx, ty).
 * The flight-path CSS translateX/Y values (up to ±100px) need to be
 * much smaller in world space so the butterfly sways gently rather
 * than flying across the entire scene.
 */
export const FLIGHT_PATH_TX_SCALE = 0.002;

// ─── Dimensions (world units) ────────────────────────────────────────────────

export const DIMS = {
	upperOuter: { w: 1.3, h: 0.7 },
	upperInner: { w: 1.0, h: 0.6 },
	lowerOuter: { w: 1.0, h: 0.55 },
	lowerInner: { w: 0.6, h: 0.45 },
	// Body intentionally thinner than raw CSS proportions (20×110px → 0.10×0.55).
	// In WebGL true 3D, rotateY(100°) doesn't foreshorten like CSS perspective,
	// so we keep the body small so it reads as a thin line between wings.
	body: { radius: 0.06, halfHeight: 0.4 },
} as const;

// ─── Colors ──────────────────────────────────────────────────────────────────

/**
 * Wing gradient stops (135deg diagonal).
 * Slightly more saturated than the raw CSS values to compensate for
 * WebGL gamma / blending differences — without this the wings appear
 * nearly pure white in the 3D scene.
 */
export const WING_GRADIENT_COLORS = [
	new THREE.Color(0.95, 0.95, 0.97), // $wing-1  warm white
	new THREE.Color(0.88, 0.94, 1.0), // $wing-2  light blue
	new THREE.Color(0.78, 0.88, 1.0), // $wing-3  sky blue
	new THREE.Color(0.88, 0.8, 1.0), // $wing-4  lavender
	new THREE.Color(1.0, 0.85, 0.94), // $wing-5  pink
] as const;

export const WING_OUTER_OPACITY = 0.85;
export const WING_INNER_OPACITY = 0.7;

/** Body gradient — matches $surface-primary → $surface-secondary at 249deg */
export const BODY_COLOR_TOP = new THREE.Color(0xd6d5ce);
export const BODY_COLOR_BOTTOM = new THREE.Color(0xb4afa6);

/** Border — matches $border-subtle #d3d3d3b5 */
export const BORDER_COLOR = 0xd3d3d3;
export const BORDER_OPACITY = 0.71;

// ─── Wing angles (radians) ──────────────────────────────────────────────────

export const UPPER_BIT_ROTZ = 40 * DEG2RAD;
export const LOWER_BIT_ROTZ = -40 * DEG2RAD;

/** Body rotation around Y — CSS `rotateY(100deg)` */
export const BODY_ROTY = 100 * DEG2RAD;

// ─── Flap animation range (radians) ─────────────────────────────────────────

export const FLAP = {
	left: { from: -20 * DEG2RAD, to: 90 * DEG2RAD },
	right: { from: 200 * DEG2RAD, to: 90 * DEG2RAD },
} as const;

// ─── Inner overlay Z-offset (prevents z-fighting) ──────────────────────────

export const INNER_Z_OFFSET = 0.001;

// ─── Per-stop alpha values (from CSS gradient rgba alpha channels) ───────────
// CSS: $wing-1 rgba(…,0.9), $wing-2 rgba(…,0.85), $wing-3 rgba(…,0.8),
//      $wing-4 rgba(…,0.8), $wing-5 rgba(…,0.85)
// Combined with .wing { opacity: 0.85 } gives effective 0.68–0.765 per pixel.
export const WING_STOP_ALPHAS = [0.9, 0.85, 0.8, 0.8, 0.85] as const;

// ─── Flight-path keyframes (from CSS @keyframes flightPathLeft) ─────────────
//
// Each entry: { t, rx, ry, rz, tx, ty, sx } — angles in degrees, tx/ty in CSS px.
// The animation module converts to radians/world-units at runtime.

export interface FlightPathKeyframe {
	t: number;
	rx: number;
	ry: number;
	rz: number;
	tx: number;
	ty: number;
	sx: number;
}

// Flight-path rotations are scaled down from CSS values.
// CSS 3D transforms with flat-screen perspective look fine at 50°+ tilts,
// but in true WebGL 3D, those angles cause wings to appear edge-on.
// We use ~15–25% of the original CSS angles for gentle body sway.
export const FLIGHT_PATH_KEYFRAMES: readonly FlightPathKeyframe[] = [
	{ t: 0.0, rx: 8, ry: 4, rz: -10, tx: 0, ty: 0, sx: -1 },
	{ t: 0.1, rx: 10, ry: 6, rz: -8, tx: 10, ty: -15, sx: -1.03 },
	{ t: 0.2, rx: 7, ry: 7, rz: -5, tx: 22, ty: -30, sx: -0.96 },
	{ t: 0.3, rx: 6, ry: 3, rz: -12, tx: 5, ty: -40, sx: -0.94 },
	{ t: 0.4, rx: 10, ry: 4, rz: -11, tx: 18, ty: -55, sx: -1.02 },
	{ t: 0.5, rx: 8, ry: 4, rz: -10, tx: 0, ty: 0, sx: -1 },
	{ t: 0.6, rx: 8, ry: 3, rz: -12, tx: 8, ty: -70, sx: -0.95 },
	{ t: 0.7, rx: 6, ry: 2, rz: -14, tx: -10, ty: -85, sx: -0.9 },
	{ t: 0.8, rx: 8, ry: 6, rz: -9, tx: 5, ty: -95, sx: -1.05 },
	{ t: 0.9, rx: 9, ry: 8, rz: -5, tx: 12, ty: -100, sx: -1.1 },
	{ t: 1.0, rx: 8, ry: 4, rz: -10, tx: 0, ty: 0, sx: -1 },
] as const;

/** Flight-path loop duration in seconds (matches CSS 10s). */
export const FLIGHT_PATH_DURATION = 10;

/**
 * Base visual scale for WebGL butterfly geometry.
 * The geometry is authored in PX_TO_WORLD (0.01) units, making wings ~1.3 wide.
 * At 0.3 scale, wing span ≈ 1.3 × 0.3 × visualScale ≈ 0.25–0.39 world units,
 * which is visible at typical scene distances (camera radius ~1).
 * Tuned to produce decorative butterflies roughly 40–60% the size of
 * the interactive CSS butterfly.
 */
export const BUTTERFLY_BASE_SCALE = 0.12;
