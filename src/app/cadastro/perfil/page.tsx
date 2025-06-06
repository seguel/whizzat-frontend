"use client";

import { useAuthGuard } from "../../lib/hooks/useAuthGuard";
import PerfilForm from "./PerfilForm";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PerfilPage() {
  const { isReady } = useAuthGuard("/cadastro/login");

  if (!isReady) return <LoadingSpinner />;

  return <PerfilForm />;
}
