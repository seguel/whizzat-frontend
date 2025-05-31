"use client";

import { useAuthGuard } from "../../lib/hooks/useAuthGuard";
import PerfilForm from "./PerfilForm";

export default function PerfilPage() {
  const { isReady } = useAuthGuard("/cadastro/login");

  if (!isReady) return null; // ou <LoadingSpinner />

  return <PerfilForm />;
}
