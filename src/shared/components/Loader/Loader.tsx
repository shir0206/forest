import React from "react";
import { Html, useProgress } from "@react-three/drei";
import "./loader.scss";

export default function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-content">
          <div className="organic-shape">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient
                  id="gradient1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#d4a5a5" />
                  <stop offset="100%" stopColor="#c8b8a8" />
                </linearGradient>
              </defs>
              <path
                fill="url(#gradient1)"
                d="M45.7,-57.8C58.9,-49.3,69.2,-36.2,74.3,-21.2C79.4,-6.2,79.3,10.7,73.1,25.3C66.9,39.9,54.6,52.2,40.2,59.8C25.8,67.4,9.3,70.3,-6.3,68.9C-21.9,67.5,-36.6,61.8,-48.9,52.8C-61.2,43.8,-71.1,31.5,-75.3,17.4C-79.5,3.3,-78,-12.6,-71.2,-26.3C-64.4,-40,-52.3,-51.5,-38.9,-59.8C-25.5,-68.1,-10.8,-73.2,3.2,-77.3C17.2,-81.4,32.5,-66.3,45.7,-57.8Z"
                transform="translate(100 100)"
                opacity="0.3"
              />
            </svg>
          </div>

          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                <div className="progress-glow"></div>
              </div>
            </div>

            <div className="progress-text">
              <span className="percentage">{progress.toFixed(0)}%</span>
              <span className="label">LOADING...</span>
            </div>
          </div>

          <div className="floating-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
          </div>
        </div>
      </div>
    </Html>
  );
}
