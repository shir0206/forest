"use client";

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import "./butterfly.scss";
import { useAppContext } from "../../../contexts/AppContext";
import { WINDOW_STATE } from "../../../types/app";

type ButterflyProps = {
  position: [number, number, number];
};

function Wing({ paused }: { paused: boolean }) {
  return (
    <div className={`wing${paused ? " pause-animation" : ""}`}>
      <div className="bit" />
      <div className="bit" />
    </div>
  );
}

function Sparkles({ paused, count = 6 }: { paused: boolean; count?: number }) {
  return (
    <div className="sparkles">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className={`sparkle${paused ? " pause-animation" : ""}`} />
      ))}
    </div>
  );
}

export default function Butterfly({ position }: ButterflyProps) {
  const { windowState, setWindowState } = useAppContext();

  const paused = windowState !== WINDOW_STATE.CLOSED;

  const htmlPosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setWindowState(WINDOW_STATE.OPEN);
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
        className="butterfly-button"
        onClick={handleClick}
        aria-label="Interactive butterfly - click to learn more about the developer"
      >
        <div className={`butterfly${paused ? " pause-animation" : ""}`}>
          <Wing paused={paused} />
          <Wing paused={paused} />
        </div>

        <Sparkles paused={paused} />
      </button>
    </Html>
  );
}
