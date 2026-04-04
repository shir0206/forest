export const DEVICE = {
  MOBILE: "mobile",
  DESKTOP: "desktop",
} as const;

export type DeviceType = (typeof DEVICE)[keyof typeof DEVICE];

export function isDeviceType(value: unknown): value is DeviceType {
  return Object.values(DEVICE).includes(value as DeviceType);
}

export interface DeviceConfig {
  butterflyCount: {
    [DEVICE.MOBILE]: number;
    [DEVICE.DESKTOP]: number;
  };
}

export interface DeviceDetectionResult {
  type: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
  userAgent: string;
  viewportWidth: number;
}
