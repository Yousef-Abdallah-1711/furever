import type { ReactNode } from "react";
import { MaintenanceBanner } from "@/components/dashboard/MaintenanceBanner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MaintenanceBanner />
      {children}
    </>
  );
}
