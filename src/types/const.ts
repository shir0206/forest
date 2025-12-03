import { PositionThreeD } from "./types";
import * as THREE from "three";

export const backgroundFile: string =
  "./hdri/Gemini_Generated_Image_oo7v4roo7v4roo7v_upscayl_2x_digital-art-4x.done2(3).exr";

export const initCameraPos: PositionThreeD = [-0.0069, -0.9996, -0.0255];
export const butterflyPos: PositionThreeD = [-0.42, -0.15, -0.4365];

export const sceneAnimationPoints = [
  new THREE.Vector3(-0.0069, -0.9996, -0.0255),
  new THREE.Vector3(-0.0386, -0.9987, -0.0331),
  new THREE.Vector3(-0.7787, -0.056, -0.6249),
  new THREE.Vector3(-0.5161, 0.1915, 0.8348),
  new THREE.Vector3(0.59, 0.15, 0.7885),
  new THREE.Vector3(0.6, 0.24, 0.6234),
];
