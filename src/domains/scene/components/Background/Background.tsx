import { useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";

import * as THREE from "three";

import { SCENE_CONFIG } from "../../config/scene";

export default function Background() {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, SCENE_CONFIG.backgroundFile);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;

    return () => {
      scene.background = null;
    };
  }, [texture, scene]);

  return null;
}
