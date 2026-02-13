"use client";

import React, { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MOVING_DIRECTION, MovingDirection } from "../../../types/app";
import "./butterfly.scss";
import { useAppContext } from "../../../contexts/AppContext";
import { WINDOW_STATE } from "../../../types/app";
import useCameraAnimation from "../../../hooks/useCameraAnimation";
import { CAMERA_ANIMATION_PRESETS } from "../../../config/3d";
type ButterflyProps = {
  position: [number, number, number];
  /**
   * Controls ref from CameraControls component
   * Passed down to enable camera animation
   */
  controlsRef: React.RefObject<any>;
  /**
   * Distance threshold from butterfly position where click is enabled
   * Default: 2 units
   */
  clickDistanceThreshold?: number;
};

function Wing() {
  return (
    <div className="wing">
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
}: ButterflyProps) {
  const { windowState, setWindowState } = useAppContext();
  const { camera } = useThree();
  const { animateToPosition, getCameraRelativePosition } =
    useCameraAnimation(controlsRef);
  const [lookingDirection, setLookingDirection] = useState<MovingDirection>(
    MOVING_DIRECTION.LEFT
  );

  const paused = windowState !== WINDOW_STATE.CLOSED;

  const htmlPosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  // Target camera position for the animation (last position in SCENE_ANIMATION_POSITIONS)
  const targetCameraPosition = useMemo(
    () => new THREE.Vector3(0.6, 0.24, 0.6234),
    []
  );

  /**
   * Check if camera is within clickable range of the butterfly
   */
  function isInClickableRange(): boolean {
    const distance = camera.position.distanceTo(targetCameraPosition);
    return distance <= clickDistanceThreshold;
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();

    // Only allow click if camera is in the right position
    if (!isInClickableRange()) {
      console.log(
        "📍 Camera too far from butterfly position. Animating to position..."
      );

      const relativePosition = getCameraRelativePosition(targetCameraPosition);
      console.log("📐 Relative position to target:", relativePosition);
      setLookingDirection(
        relativePosition.isLeft ? MOVING_DIRECTION.RIGHT : MOVING_DIRECTION.LEFT
      );

      // Animate camera to the target position with parabolic motion
      animateToPosition({
        targetPosition: targetCameraPosition,
        duration: CAMERA_ANIMATION_PRESETS.smoothArc.duration,
        ease: CAMERA_ANIMATION_PRESETS.smoothArc.ease,
        arcHeight: CAMERA_ANIMATION_PRESETS.smoothArc.arcHeight,
        onComplete: () => {
          console.log("🎬 Camera animation complete");
          // After animation completes, open the window
          setWindowState(WINDOW_STATE.OPEN);
        },
      });
    } else {
      console.log("📍 Camera in range. Opening window directly.");
      // Camera is already in position, open immediately
      setWindowState(WINDOW_STATE.OPEN);
    }
  }

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
        }`}
        onClick={handleClick}
        aria-label="Interactive butterfly - click to learn more about the developer"
      >
        <div className="butterfly">
          <Wing />
          <Wing />
        </div>

        <Sparkles />
      </button>
    </Html>
  );
}
