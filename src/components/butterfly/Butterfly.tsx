"use client";
import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./butterfly.scss";

type PositionedButterflyProps = {
  position: [number, number, number];
  openAbout: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
};

export default function PositionedButterfly({
  position,
  openAbout,
}: PositionedButterflyProps) {
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // Center the butterfly at the 3D position point
      wrapperClass="butterfly-container"
      distanceFactor={2} // Determines the amount of size change when zooming in/out
      scale={[0.005, 0.005, 0.005]} // Adjust the size of the butterfly within the scene
    >
      <button onClick={openAbout}>
        <div className="butterfly" onClick={openAbout}>
          <div className="wing">
            <div className="bit"></div>
            <div className="bit"></div>
          </div>
          <div className="wing">
            <div className="bit"></div>
            <div className="bit"></div>
          </div>
        </div>
        <div className="sparkles">
          <i className="sparkle"></i>
          <i className="sparkle"></i>
          <i className="sparkle"></i>
          <i className="sparkle"></i>
          <i className="sparkle"></i>
          <i className="sparkle"></i>
        </div>
      </button>
    </Html>
  );
}
