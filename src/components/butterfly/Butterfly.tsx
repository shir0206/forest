"use client";
import React, { useEffect } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./butterfly.scss";

type ButterflyProps = {
  position: [number, number, number];
  openAbout: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isAboutOpen: boolean;
};

export default function Butterfly({
  position,
  openAbout,
  isAboutOpen,
}: ButterflyProps) {
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // Center the butterfly at the 3D position point
      wrapperClass="butterfly-container"
      distanceFactor={2} // Determines the amount of size change when zooming in/out
      scale={[0.005, 0.005, 0.005]} // Adjust the size of the butterfly within the scene
    >
      <button className="buttefly-button" onClick={openAbout}>
        <div className={`butterfly${isAboutOpen ? " pause-animation" : ""}`}>
          <div className={`wing${isAboutOpen ? " pause-animation" : ""}`}>
            <div className="bit"></div>
            <div className="bit"></div>
          </div>
          <div className={`wing${isAboutOpen ? " pause-animation" : ""}`}>
            <div className="bit"></div>
            <div className="bit"></div>
          </div>
        </div>
        <div className="sparkles">
          <i className={`sparkle${isAboutOpen ? " pause-animation" : ""}`}></i>
          <i className={`sparkle${isAboutOpen ? " pause-animation" : ""}`}></i>
          <i className={`sparkle${isAboutOpen ? " pause-animation" : ""}`}></i>
          <i className={`sparkle${isAboutOpen ? " pause-animation" : ""}`}></i>
          <i className={`sparkle${isAboutOpen ? " pause-animation" : ""}`}></i>
          <i className={`sparkle${isAboutOpen ? " pause-animation" : ""}`}></i>
        </div>
      </button>
    </Html>
  );
}
