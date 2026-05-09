import { MobileOptimizedLayout } from "./MobileOptimizedLayout";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";
import { NativeBootstrap } from "./NativeBootstrap";

export function AppLayout() {
  return (
    <>
      <NativeBootstrap />
      <MobileOptimizedLayout />
      <NotificationPermissionBanner />
    </>
  );
}

export default AppLayout;
