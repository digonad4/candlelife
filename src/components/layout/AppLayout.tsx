import { MobileOptimizedLayout } from "./MobileOptimizedLayout";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";

export function AppLayout() {
  return (
    <>
      <MobileOptimizedLayout />
      <NotificationPermissionBanner />
    </>
  );
}

export default AppLayout;