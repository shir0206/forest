import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { SCENE_CONFIG } from "../../../config/3d";

export default function Background() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(SCENE_CONFIG.backgroundFile, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
    });
  }, [scene]);

  return null;
}
