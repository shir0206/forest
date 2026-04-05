import React, { useMemo } from "react";

import {
  INNER_Z_OFFSET,
  LOWER_BIT_ROTZ,
  UPPER_BIT_ROTZ,
  WING_INNER_OPACITY,
} from "../../core/constants";
import {
  getLowerInnerGeometry,
  getLowerOuterGeometry,
  getUpperInnerGeometry,
  getUpperOuterGeometry,
} from "../../core/geometry";
import { getWingOuterMaterial } from "../../core/materials";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WingMeshProps {
  /** Flip each wing petal 180° on its local Y axis (shows backface). */
  flipPetals?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WingMesh({
  flipPetals = false,
}: WingMeshProps): React.JSX.Element {
  // Shared geometries (module-level cache — zero allocation)
  const upperOuterGeo = getUpperOuterGeometry();
  const upperInnerGeo = getUpperInnerGeometry();
  const lowerOuterGeo = getLowerOuterGeometry();
  const lowerInnerGeo = getLowerInnerGeometry();

  // Per-butterfly material clones (need independent opacity uniform)
  const wingMat = useMemo(() => getWingOuterMaterial().clone(), []);
  const wingInnerMat = useMemo(() => {
    const mat = getWingOuterMaterial().clone();
    mat.uniforms.uOpacity.value = WING_INNER_OPACITY;
    return mat;
  }, []);

  const petalRY = flipPetals ? Math.PI : 0;

  return (
    <>
      {/* Upper bit */}
      <group rotation={[0, petalRY, UPPER_BIT_ROTZ + Math.PI]}>
        {/* Outer surface */}
        <mesh geometry={upperOuterGeo} material={wingMat} />
        {/* Inner overlay — CSS left:-30px top:5px */}
        <group position={[-0.3, -0.05, INNER_Z_OFFSET]}>
          <mesh geometry={upperInnerGeo} material={wingInnerMat} />
        </group>
      </group>

      {/* Lower bit */}
      <group rotation={[0, petalRY, LOWER_BIT_ROTZ + Math.PI]}>
        {/* Outer surface */}
        <mesh geometry={lowerOuterGeo} material={wingMat} />
        {/* Inner overlay — CSS left:-24px top:5px */}
        <group position={[-0.24, -0.05, INNER_Z_OFFSET]}>
          <mesh geometry={lowerInnerGeo} material={wingInnerMat} />
        </group>
      </group>
    </>
  );
}
