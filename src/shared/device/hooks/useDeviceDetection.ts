import { useAppContext } from "../../context";
import { DEVICE_CONFIG, DEVICE_DETECTION_CONFIG } from "../config";
import { DEVICE, DeviceDetectionResult } from "../types/types";

// Plain functions replacing the class static methods
function isMobileDevice(userAgent: string, viewportWidth: number): boolean {
  if (viewportWidth < DEVICE_DETECTION_CONFIG.mobileViewportThreshold) {
    return true;
  }
  return DEVICE_DETECTION_CONFIG.mobileUserAgentPatterns.some((pattern) =>
    pattern.test(userAgent)
  );
}

export function detectDevice(): DeviceDetectionResult {
  const userAgent = navigator.userAgent;
  const viewportWidth = window.innerWidth;
  const isMobile = isMobileDevice(userAgent, viewportWidth);
  const type = isMobile ? DEVICE.MOBILE : DEVICE.DESKTOP;

  return {
    type,
    isMobile,
    isDesktop: !isMobile,
    userAgent,
    viewportWidth,
  };
}

/**
 * Custom hook for device detection and device-specific configuration
 * @returns Device type, detection result, and butterfly count based on device
 */
export function useDeviceDetection() {
  const appContext = useAppContext();
  const detectionResult = detectDevice();

  if (!appContext) {
    console.error("useDeviceDetection: AppContext not found");
    return {
      device: detectionResult.type,
      butterflyCount: DEVICE_CONFIG.butterflyCount.desktop,
      ...detectionResult,
    };
  }

  const { device } = appContext;
  const butterflyCount =
    DEVICE_CONFIG.butterflyCount[
      device as keyof typeof DEVICE_CONFIG.butterflyCount
    ] || DEVICE_CONFIG.butterflyCount.desktop;

  return {
    device,
    butterflyCount,
    ...detectionResult,
  };
}
