"use client";

import { ReactNode } from "react";
import AuthGuard from "../components/AuthGuard";
import { NotificationProvider } from "../components/perfil/NotificationContext";
import { ProfileProvider } from "../components/perfil/ProfileContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ProfileProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}
