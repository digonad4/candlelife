import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { nativeService } from "@/services/NativeService";

/**
 * Initializes native platform services (StatusBar, Keyboard listeners, etc.)
 * Runs once at app mount. No-op on web.
 */
export const NativeBootstrap = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      nativeService.initialize();
    }
  }, []);
  return null;
};
