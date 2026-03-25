"use client";

import React, { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import * as THREE from "three";

import "./butterfly.scss";

import {
  CAMERA_ANIMATION_PRESETS,
  SCENE_ANIMATION_POSITIONS,
  SCENE_CONFIG,
} from "../../../config/3d";
import useCameraAnimation from "../../../hooks/animation/useCameraAnimation";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { MOVING_DIRECTION, MovingDirection } from "../../../types/app";
import { WINDOW_STATE } from "../../../types/app";

type ButterflyProps = {
  controlsRef?: React.RefObject<any>;
};

export function Wing({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="wing" style={style}>
      <div className="bit" />
      <div className="bit" />
    </div>
  );
}

function Sparkles({ count = 6 }: { count?: number }) {
  return (
    <div className="sparkles">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className="sparkle" />
      ))}
    </div>
  );
}

export default function Butterfly({ controlsRef }: ButterflyProps) {
  const { windowState, setWindowState, runIntro } = useAppContext();

  const { camera } = useThree();
  const { animateToPosition, getCameraRelativePosition } = useCameraAnimation(
    controlsRef as React.RefObject<any>
  );
  const [lookingDirection, setLookingDirection] = useState<MovingDirection>(
    MOVING_DIRECTION.RIGHT
  );

  const position = SCENE_CONFIG.butterflyPos;
  const clickDistanceThreshold = SCENE_CONFIG.clickDistanceThreshold;

  const paused = windowState !== WINDOW_STATE.CLOSED;

  const htmlPosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  const targetCameraPosition = useMemo(
    () =>
      new THREE.Vector3(
        ...SCENE_ANIMATION_POSITIONS[SCENE_ANIMATION_POSITIONS.length - 1]
      ),
    []
  );

  function isInClickableRange(): boolean {
    const distance = camera.position.distanceTo(targetCameraPosition);
    return distance <= clickDistanceThreshold;
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();

    if (runIntro) return; // Prevent interaction during intro animation

    if (!isInClickableRange()) {
      const relativePosition = getCameraRelativePosition(targetCameraPosition);
      setLookingDirection(
        relativePosition.isLeft ? MOVING_DIRECTION.RIGHT : MOVING_DIRECTION.LEFT
      );
      animateToPosition({
        targetPosition: targetCameraPosition,
        duration: CAMERA_ANIMATION_PRESETS.smoothArc.duration,
        ease: CAMERA_ANIMATION_PRESETS.smoothArc.ease,
        arcHeight: CAMERA_ANIMATION_PRESETS.smoothArc.arcHeight,
        onComplete: () => {
          setWindowState(WINDOW_STATE.OPEN);
        },
      });
    } else {
      setWindowState(WINDOW_STATE.OPEN);
    }
  }

  const wings = (
    <div className="butterfly">
      <Wing />
      <Wing />
    </div>
  );

  return (
    <Html
      position={htmlPosition}
      center
      wrapperClass="butterfly-container"
      distanceFactor={2}
      scale={[0.005, 0.005, 0.005]}
    >
      <button
        className={`butterfly-button looking-${lookingDirection} ${
          paused ? "pause-animation" : ""
        } ${runIntro ? " disable-click" : ""}`}
        onClick={handleClick}
        aria-label="Interactive butterfly - click to learn more about the developer"
        aria-hidden="true"
      >
        {wings}
        <Sparkles />
      </button>
    </Html>
  );
}
