"use client";

import { ReactNode } from "react";
import { useAuthGuard } from "../lib/hooks/useAuthGuard";
import LoadingOverlay from "./LoadingOverlay";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  redirectTo = "/cadastro/login",
}: AuthGuardProps) {
  const { isReady, isAuthenticated } = useAuthGuard(redirectTo);

  if (!isReady) {
    return <LoadingOverlay />;
  }

  // 🔒 Não autenticado → não renderiza nada
  if (!isAuthenticated) {
    return <LoadingOverlay />; // ou null
  }

  return <>{children}</>;
}
