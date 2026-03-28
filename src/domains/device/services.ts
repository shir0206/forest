// Device Domain Services

import { DEVICE_DETECTION_CONFIG } from "./config";
import { DEVICE, DeviceDetectionResult, DeviceType } from "./types";

export class DeviceDetectionService {
  static detectDevice(): DeviceDetectionResult {
    const userAgent = navigator.userAgent;
    const viewportWidth = window.innerWidth;

    const isMobile = this.isMobileDevice(userAgent, viewportWidth);
    const type = isMobile ? DEVICE.MOBILE : DEVICE.DESKTOP;

    return {
      type,
      isMobile,
      isDesktop: !isMobile,
      userAgent,
      viewportWidth,
    };
  }

  static isMobileDevice(userAgent: string, viewportWidth: number): boolean {
    // Check viewport width first (more reliable)
    if (viewportWidth < DEVICE_DETECTION_CONFIG.mobileViewportThreshold) {
      return true;
    }

    // Check user agent patterns as fallback
    return DEVICE_DETECTION_CONFIG.mobileUserAgentPatterns.some((pattern) =>
      pattern.test(userAgent)
    );
  }

  static getCurrentDeviceType(): DeviceType {
    return this.detectDevice().type;
  }

  static isCurrentDeviceMobile(): boolean {
    return this.detectDevice().isMobile;
  }

  static isCurrentDeviceDesktop(): boolean {
    return this.detectDevice().isDesktop;
  }
}

export function detectDevice(): DeviceType {
  return DeviceDetectionService.getCurrentDeviceType();
}

export function isMobile(): boolean {
  return DeviceDetectionService.isCurrentDeviceMobile();
}

export function isDesktop(): boolean {
  return DeviceDetectionService.isCurrentDeviceDesktop();
}
