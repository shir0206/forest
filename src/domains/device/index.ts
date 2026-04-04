// Device Domain Exports

// Services
export {
  detectDevice,
  DeviceDetectionService,
  isDesktop,
  isMobile,
} from "./services";

// Types
export type {
  DeviceConfig,
  DeviceDetectionResult,
  DeviceType,
} from "./types/types";
export { DEVICE, isDeviceType } from "./types/types";

// Configuration
export { DEVICE_CONFIG, DEVICE_DETECTION_CONFIG } from "./config";
