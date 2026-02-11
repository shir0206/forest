export type PositionThreeD = [number, number, number];

export interface CameraConfig {
  near: number;
  far: number;
  fov: number;
  aspect: number;
  position: PositionThreeD;
}

export interface SceneConfig {
  backgroundFile: string;
  initCameraPos: PositionThreeD;
  butterflyPos: PositionThreeD;
  animationDuration: number;
  cameraTransitionDuration: number;
}

export interface AnimationTiming {
  introDuration: number;
  screenTransition: number;
  cameraMove: number;
}
