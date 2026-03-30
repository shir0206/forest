import {
  DEG2RAD,
  FLIGHT_PATH_DURATION,
  FLIGHT_PATH_KEYFRAMES,
  FLIGHT_PATH_TX_SCALE,
  FlightPathKeyframe,
} from "./constants";

// ─── Flap easing ─────────────────────────────────────────────────────────────
//
// Approximates CSS cubic-bezier(0.48, 0.01, 0.54, 1).
// The curve is nearly symmetric with a slight ease-in bias — a smooth
// quadratic in/out is a close-enough match for real-time use.

export function easeFlap(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─── Flap oscillator ─────────────────────────────────────────────────────────
//
// Returns a 0→1 ping-pong value driven by elapsed time and per-butterfly
// flapDuration (in milliseconds).

export function flapPingPong(
  elapsedSec: number,
  flapDurationMs: number
): number {
  const speed = (2 * Math.PI) / (flapDurationMs / 1000);
  return (Math.sin(elapsedSec * speed) + 1) / 2;
}

// ─── Flight-path interpolation ───────────────────────────────────────────────

export interface FlightPathState {
  rx: number; // radians
  ry: number;
  rz: number;
  tx: number; // world units
  ty: number;
  sx: number; // scale-x
}

/**
 * Given an absolute elapsed time (seconds), returns the interpolated
 * flight-path transform by lerping between surrounding keyframes.
 *
 * The animation loops every `FLIGHT_PATH_DURATION` seconds (10s by default).
 */
export function interpolateFlightPath(elapsedSec: number): FlightPathState {
  const t = (elapsedSec % FLIGHT_PATH_DURATION) / FLIGHT_PATH_DURATION; // 0→1

  // Find surrounding keyframes
  let a: FlightPathKeyframe = FLIGHT_PATH_KEYFRAMES[0];
  let b: FlightPathKeyframe = FLIGHT_PATH_KEYFRAMES[0];

  for (let i = 0; i < FLIGHT_PATH_KEYFRAMES.length - 1; i++) {
    if (
      t >= FLIGHT_PATH_KEYFRAMES[i].t &&
      t <= FLIGHT_PATH_KEYFRAMES[i + 1].t
    ) {
      a = FLIGHT_PATH_KEYFRAMES[i];
      b = FLIGHT_PATH_KEYFRAMES[i + 1];
      break;
    }
  }

  const segLen = b.t - a.t;
  const local = segLen > 0 ? (t - a.t) / segLen : 0;
  // Smooth the interpolation between keyframes
  const s = local * local * (3 - 2 * local);
  return {
    rx: lerp(a.rx, b.rx, s) * DEG2RAD,
    ry: lerp(a.ry, b.ry, s) * DEG2RAD,
    rz: lerp(a.rz, b.rz, s) * DEG2RAD,
    tx: lerp(a.tx, b.tx, s) * FLIGHT_PATH_TX_SCALE,
    ty: lerp(a.ty, b.ty, s) * FLIGHT_PATH_TX_SCALE,
    sx: lerp(a.sx, b.sx, s),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
