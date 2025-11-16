"use client";
import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./butterfly.scss";

export default function PositionedButterfly({ position }) {
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // מרכז את הפרפר בנקודת המיקום התלת-ממדית
      wrapperClass="butterfly-container" // קלאס עוטף לצורך הגדרת גודל בסיס
      distanceFactor={2} // קובע את מידת השינוי בגודל בעת התרחקות/התקרבות
      scale={[0.005, 0.005, 0.005]} // התאמת גודל הפרפר בתוך הסצנה
    >
      <div className="butterfly" onClick={() => alert("🦋 הפרפר נגע בך!")}>
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
        <i class="sparkle"></i>
        <i class="sparkle"></i>
        <i class="sparkle"></i>
        <i class="sparkle"></i>
        <i class="sparkle"></i>
        <i class="sparkle"></i>
      </div>
    </Html>
  );
}
