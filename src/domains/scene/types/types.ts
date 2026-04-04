import { PositionThreeD } from "../../camera/types/types";

export interface SceneConfig {
  backgroundFile: string;
  initCameraPos: PositionThreeD;
  butterflyPos: PositionThreeD;
  animationDuration: number;
  cameraTransitionDuration: number;
}
