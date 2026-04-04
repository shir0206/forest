import { useAppContext } from "../../context";
import { DEVICE_CONFIG } from "../../device/config";
import { DeviceType } from "../../device/types/types";

/**
 * Custom hook for device detection and device-specific configuration
 * @returns Device type and butterfly count based on device
 */
export function useDeviceDetection() {
  const appContext = useAppContext();

  if (!appContext) {
    console.error("useDeviceDetection: AppContext not found");
    return {
      device: "desktop" as DeviceType,
      butterflyCount: DEVICE_CONFIG.butterflyCount.desktop,
    };
  }

  const { device } = appContext;
  const butterflyCount = DEVICE_CONFIG.butterflyCount[device];

  return {
    device,
    butterflyCount,
  };
}
