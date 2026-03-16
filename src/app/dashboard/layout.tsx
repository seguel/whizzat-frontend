"use client";

import { ReactNode } from "react";
import AuthGuard from "../components/AuthGuard";
import { NotificationProvider } from "../components/perfil/NotificationContext";
import { ProfileProvider } from "../components/perfil/ProfileContext";
import { UserProvider } from "../components/perfil/UserContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <UserProvider>
        <ProfileProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ProfileProvider>
      </UserProvider>
    </AuthGuard>
  );
}
