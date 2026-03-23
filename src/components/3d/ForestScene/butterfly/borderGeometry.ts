import * as THREE from "three";
import { DIMS } from "./constants";

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

export function getUpperBorderGeometry(): THREE.BufferGeometry {
	if (!_upperBorderGeo) {
		const pts = createWingBorderPoints(DIMS.upperOuter.w, DIMS.upperOuter.h);
		_upperBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
	}
	return _upperBorderGeo;
}

export function getLowerBorderGeometry(): THREE.BufferGeometry {
	if (!_lowerBorderGeo) {
		const pts = createWingBorderPoints(DIMS.lowerOuter.w, DIMS.lowerOuter.h);
		_lowerBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
	}
	return _lowerBorderGeo;
}

export function getUpperInnerBorderGeometry(): THREE.BufferGeometry {
	if (!_upperInnerBorderGeo) {
		const pts = createWingBorderPoints(DIMS.upperInner.w, DIMS.upperInner.h);
		_upperInnerBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
	}
	return _upperInnerBorderGeo;
}

export function getLowerInnerBorderGeometry(): THREE.BufferGeometry {
	if (!_lowerInnerBorderGeo) {
		const pts = createWingBorderPoints(DIMS.lowerInner.w, DIMS.lowerInner.h);
		_lowerInnerBorderGeo = new THREE.BufferGeometry().setFromPoints(pts);
	}
	return _lowerInnerBorderGeo;
}

/**
 * Cleanup function for development/testing
 */
export function clearBorderGeometryCache(): void {
	_upperBorderGeo?.dispose();
	_lowerBorderGeo?.dispose();
	_upperInnerBorderGeo?.dispose();
	_lowerInnerBorderGeo?.dispose();
	
	_upperBorderGeo = null;
	_lowerBorderGeo = null;
	_upperInnerBorderGeo = null;
	_lowerInnerBorderGeo = null;
}
