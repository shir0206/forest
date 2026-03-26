export type WindowState = "open" | "minimized" | "maximized" | "closed";

export const WINDOW_STATE = {
  OPEN: "open" as WindowState,
  MINIMIZED: "minimized" as WindowState,
  MAXIMIZED: "maximized" as WindowState,
  CLOSED: "closed" as WindowState,
};

export type ScreenId = "overview" | "aboutMe" | "service" | "contact";

export interface ScreenConfig {
  id: ScreenId;
  title: string;
  component: React.ComponentType;
}

export interface AnimationConfig {
  type: "spring" | "tween";
  stiffness: number;
  damping: number;
  mass: number;
  duration?: number;
  ease?: number[];
}
