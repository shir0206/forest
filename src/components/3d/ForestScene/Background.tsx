import { useThree, useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { SCENE_CONFIG } from "../../../config/3d";

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
