// Device Domain Configuration

import { DEVICE, DeviceConfig } from "./types/types";

/**
 * Device configuration - single source of truth for device-specific settings
 */
export const DEVICE_CONFIG: DeviceConfig = {
  butterflyCount: {
    [DEVICE.MOBILE]: 5,
    [DEVICE.DESKTOP]: 8,
  },
} as const;

/**
 * Device detection thresholds and patterns
 */
export const DEVICE_DETECTION_CONFIG = {
  mobileViewportThreshold: 768,
  mobileUserAgentPatterns: [
    /iPhone/i,
    /iPad/i,
    /Android/i,
    /BlackBerry/i,
    /IEMobile/i,
    /Opera Mini/i,
  ],
} as const;
