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

export type MovingDirection = "left" | "right";

export const MOVING_DIRECTION = {
  LEFT: "left" as MovingDirection,
  RIGHT: "right" as MovingDirection,
} as const;

export interface CameraAnimationConfig {
  duration: number;
  easing: (t: number) => number;
  delay?: number;
}

export interface CameraAnimationSequenceConfig {
  positions: PositionThreeD[];
  durations: number[];
  easings: ((t: number) => number)[];
}
