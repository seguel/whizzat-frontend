"use client";

import { ReactNode } from "react";
import AuthGuard from "../components/AuthGuard";
import { NotificationProvider } from "../components/perfil/NotificationContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthGuard>
  );
}
