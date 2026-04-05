import { useEffect, useRef } from "react";

import * as THREE from "three";

interface WingAnimationConfig {
  wingFlapSpeed: number;
  wingFlapAmplitude: number;
  wingRotationSpeed: number;
  wingRotationAmplitude: number;
  wingTiltSpeed: number;
  wingTiltAmplitude: number;
}

interface UseWingAnimationReturn {
  wingMesh: THREE.Mesh | null;
  wingMaterial: THREE.ShaderMaterial | null;
  updateWingAnimation: (deltaTime: number) => void;
}

export function useWingAnimation(
  config: WingAnimationConfig,
  wingGeometry: THREE.BufferGeometry | null,
  wingMaterial: THREE.ShaderMaterial | null
): UseWingAnimationReturn {
  const wingMeshRef = useRef<THREE.Mesh | null>(null);
  const wingMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const wingAnimationTimeRef = useRef(0);

  useEffect(() => {
    if (wingGeometry && wingMaterial) {
      wingMeshRef.current = new THREE.Mesh(wingGeometry, wingMaterial);
      wingMaterialRef.current = wingMaterial;
    }
  }, [wingGeometry, wingMaterial]);

  const updateWingAnimation = (deltaTime: number) => {
    if (!wingMeshRef.current || !wingMaterialRef.current) return;

    const wingMaterial = wingMaterialRef.current;
    const wingMesh = wingMeshRef.current;

    // Update wing animation time
    wingAnimationTimeRef.current += deltaTime;

    // Calculate wing flap animation
    const wingFlap =
      Math.sin(wingAnimationTimeRef.current * config.wingFlapSpeed) *
      config.wingFlapAmplitude;

    // Calculate wing rotation animation
    const wingRotation =
      Math.sin(wingAnimationTimeRef.current * config.wingRotationSpeed) *
      config.wingRotationAmplitude;

    // Calculate wing tilt animation
    const wingTilt =
      Math.sin(wingAnimationTimeRef.current * config.wingTiltSpeed) *
      config.wingTiltAmplitude;

    // Update wing material uniforms
    if (wingMaterial.uniforms) {
      wingMaterial.uniforms.uTime.value = wingAnimationTimeRef.current;
      wingMaterial.uniforms.uWingFlap.value = wingFlap;
      wingMaterial.uniforms.uWingRotation.value = wingRotation;
      wingMaterial.uniforms.uWingTilt.value = wingTilt;
    }

    // Update wing mesh rotation
    wingMesh.rotation.x = wingFlap;
    wingMesh.rotation.y = wingRotation;
    wingMesh.rotation.z = wingTilt;

    // Update wing material
    wingMaterial.needsUpdate = true;
  };

  return {
    wingMesh: wingMeshRef.current,
    wingMaterial: wingMaterialRef.current,
    updateWingAnimation,
  };
}
