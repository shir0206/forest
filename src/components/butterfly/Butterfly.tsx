"use client";
import React, { MouseEventHandler, useEffect } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./butterfly.scss";
import { useAppContext } from "../../contexts/AppContext";
import { WINDOW_STATE } from "../../types/app";

type ButterflyProps = {
  position: [number, number, number];
};

export default function Butterfly({ position }: ButterflyProps) {
  const { windowState, setWindowState } = useAppContext();

  function openAbout(event: React.MouseEvent): void {
    event.stopPropagation();

    setWindowState(WINDOW_STATE.OPEN);
  }

  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // Center the butterfly at the 3D position point
      wrapperClass="butterfly-container"
      distanceFactor={2} // Determines the amount of size change when zooming in/out
      scale={[0.005, 0.005, 0.005]} // Adjust the size of the butterfly within the scene
    >
      <button
        className="buttefly-button"
        onClick={openAbout}
        aria-label="Interactive butterfly - click to learn more about the developer"
        role="button"
        tabIndex={0}
      >
        <div
          className={`butterfly${
            windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
          }`}
        >
          <div
            className={`wing${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          >
            <div className="bit"></div>
            <div className="bit"></div>
          </div>
          <div
            className={`wing${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          >
            <div className="bit"></div>
            <div className="bit"></div>
          </div>
        </div>
        <div className="sparkles">
          <i
            className={`sparkle${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          ></i>
          <i
            className={`sparkle${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          ></i>
          <i
            className={`sparkle${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          ></i>
          <i
            className={`sparkle${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          ></i>
          <i
            className={`sparkle${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          ></i>
          <i
            className={`sparkle${
              windowState !== WINDOW_STATE.CLOSED ? " pause-animation" : ""
            }`}
          ></i>
        </div>
      </button>
    </Html>
  );
}
