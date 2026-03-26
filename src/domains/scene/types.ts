import { PositionThreeD } from "../../shared/types/primitives";

export interface SceneConfig {
  backgroundFile: string;
  initCameraPos: PositionThreeD;
  butterflyPos: PositionThreeD;
  animationDuration: number;
  cameraTransitionDuration: number;
}
