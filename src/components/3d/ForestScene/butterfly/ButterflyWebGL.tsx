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
	BORDER_OPACITY,
	INNER_Z_OFFSET,
	WING_INNER_OPACITY,
	DEBUG_BUTTERFLIES, // 🦋 DEBUG
	ANIMATION_TIME_SCALE,
} from "./constants";
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
import {
	getUpperBorderGeometry,
	getLowerBorderGeometry,
	getUpperInnerBorderGeometry,
	getLowerInnerBorderGeometry,
} from "./borderGeometry";
import { easeFlap, flapPingPong, interpolateFlightPath } from "./animation";

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

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Decorative base-pose — gentle tilt for billboard-oriented butterflies ───
const DECORATIVE_POSE_RX = 68 * DEG2RAD;
const DECORATIVE_POSE_RY = 55 * DEG2RAD;
const DECORATIVE_POSE_RZ = -30 * DEG2RAD;

export default function ButterflyWebGL({
	flapDurationMs,
	opacityRef,
	timeOffset = 0,
	onAnimationCycle,
	lowPerformanceMode = false,
	flipPetals = false,
	mirrorX = true,
	useDecorativePose = false,
}: ButterflyWebGLProps) {
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
	const lastAnimationCycle = useRef(-1);

	// Performance optimizations for low-end devices
	const animationSteps = lowPerformanceMode ? 12 : 24;

	// 🦋 DEBUG — tweak from console: window.__butterflyPose.rx = 45
	const debugPoseRef = useRef({ rx: 68, ry: 55, rz: -30 });
	if (DEBUG_BUTTERFLIES && useDecorativePose) {
		(window as any).__butterflyPose = debugPoseRef.current;
	}

	// ─── Per-frame animation ──────────────────────────────────────────────────

	useFrame(() => {
		// 🦋 DEBUG — freeze animation, show static pose for tuning
		if (DEBUG_BUTTERFLIES) {
			// Clear flight-path transform
			if (rootRef.current) {
				rootRef.current.rotation.set(0, 0, 0);
				rootRef.current.scale.setScalar(BUTTERFLY_BASE_SCALE);
			}
			// Drive pose from debugPoseRef (reads every frame → console changes apply live)
			const poseGroup = rootRef.current?.children[0];
			if (poseGroup) {
				poseGroup.rotation.set(
					debugPoseRef.current.rx * DEG2RAD,
					debugPoseRef.current.ry * DEG2RAD,
					debugPoseRef.current.rz * DEG2RAD
				);
			}
			// Wings at rest (mid-flap)
			if (leftFlapRef.current) leftFlapRef.current.rotation.y = FLAP.left.to;
			if (rightFlapRef.current) rightFlapRef.current.rotation.y = FLAP.right.to;
			// Opacity passthrough
			const op = opacityRef.current;
			if (op !== lastOpacity.current) {
				lastOpacity.current = op;
				wingMat.uniforms.uOpacity.value = op * 0.85;
				wingInnerMat.uniforms.uOpacity.value = op * WING_INNER_OPACITY;
				bodyMat.uniforms.uOpacity.value = op;
				borderMat.opacity = op * BORDER_OPACITY;
			}
			return; // skip all animation
		}

		const elapsed = (performance.now() / 1000 + timeOffset) * ANIMATION_TIME_SCALE % 1000;

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
			// Wing: CSS .wing { opacity: 0.85 } × phase opacity
			// Per-stop alpha is baked into the shader, uOpacity = element-level
			wingMat.uniforms.uOpacity.value = op * 0.85;
			wingInnerMat.uniforms.uOpacity.value = op * WING_INNER_OPACITY;
			bodyMat.uniforms.uOpacity.value = op;
			borderMat.opacity = op * BORDER_OPACITY;
		}
	});

	// ─── Wing sub-tree (reused for left & right) ─────────────────────────────

	const petalRY = flipPetals ? Math.PI : 0;

	const WingPetals = useMemo(
		() =>
			function WingPetals() {
				return (
					<>
						{/* Upper bit */}
						<group rotation={[0, petalRY, UPPER_BIT_ROTZ + Math.PI]}>
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
						<group rotation={[0, petalRY, LOWER_BIT_ROTZ + Math.PI]}>
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
			petalRY,
		]
	);

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
