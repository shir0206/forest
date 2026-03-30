export const BROWSER_MODE = {
  OPEN: "open",
  MINIMIZED: "minimized",
  MAXIMIZED: "maximized",
  CLOSED: "closed",
} as const;

export type BrowserModeType = (typeof BROWSER_MODE)[keyof typeof BROWSER_MODE];

export const SECTION_IDS = {
  OVERVIEW: "overview",
  ABOUT: "about",
  SERVICE: "service",
  CONTACT: "contact",
} as const;

export type SectionIdType = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export interface SectionConfig {
  id: SectionIdType;
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
