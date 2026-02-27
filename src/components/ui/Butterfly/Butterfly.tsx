"use client";

import React, { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MOVING_DIRECTION, MovingDirection } from "../../../types/app";
import "./butterfly.scss";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { WINDOW_STATE } from "../../../types/app";
import useCameraAnimation from "../../../hooks/animation/useCameraAnimation";
import { CAMERA_ANIMATION_PRESETS } from "../../../config/3d";
type ButterflyProps = {
  position: [number, number, number];
  /**
   * Controls ref from CameraControls component.
   * Not required in decorative mode.
   */
  controlsRef?: React.RefObject<any>;
  /**
   * Distance threshold from butterfly position where click is enabled.
   * Default: 2 units
   */
  clickDistanceThreshold?: number;
  /**
   * When true the butterfly is purely visual: no button, no click, no sparkles.
   * Pass flapDuration to give each wing its own CSS animation speed.
   */
  decorative?: boolean;
  /** Per-wing flap duration in ms. Only used when decorative=true. */
  flapDuration?: { left: number; right: number };
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

export default function Butterfly({
  position,
  controlsRef,
  clickDistanceThreshold = 2,
  decorative = false,
  flapDuration,
}: ButterflyProps) {
  const { windowState, setWindowState } = useAppContext();
  const { camera } = useThree();
  const { animateToPosition, getCameraRelativePosition } = useCameraAnimation(
    controlsRef as React.RefObject<any>
  );
  const [lookingDirection, setLookingDirection] = useState<MovingDirection>(
    MOVING_DIRECTION.LEFT
  );

  const paused = windowState !== WINDOW_STATE.CLOSED;

  const htmlPosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  const targetCameraPosition = useMemo(
    () => new THREE.Vector3(0.6, 0.24, 0.6234),
    []
  );

  function isInClickableRange(): boolean {
    const distance = camera.position.distanceTo(targetCameraPosition);
    return distance <= clickDistanceThreshold;
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
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
      <Wing
        style={
          flapDuration
            ? ({
                "--flap-duration": `${flapDuration.left}ms`,
              } as React.CSSProperties)
            : undefined
        }
      />
      <Wing
        style={
          flapDuration
            ? ({
                "--flap-duration": `${flapDuration.right}ms`,
              } as React.CSSProperties)
            : undefined
        }
      />
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
      {decorative ? (
        <div
          className={`butterfly-button looking-${lookingDirection}`}
          style={{ pointerEvents: "none", opacity: 0.85 }}
          aria-hidden="true"
        >
          {wings}
        </div>
      ) : (
        <button
          className={`butterfly-button looking-${lookingDirection} ${
            paused ? "pause-animation" : ""
          }`}
          onClick={handleClick}
          aria-label="Interactive butterfly - click to learn more about the developer"
        >
          {wings}
          <Sparkles />
        </button>
      )}
    </Html>
  );
}
