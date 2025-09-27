"use client";

import { useState, useEffect, useTransition } from "react";
import LoadingOverlay from "./LoadingOverlay";

export default function PageWrapper({
  children,
  externalLoading,
}: {
  children: React.ReactNode;
  externalLoading?: boolean;
}) {
  const [isPending] = useTransition();
  const [loading, setLoading] = useState(false);

  // controla loading interno e externo
  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
    } else {
      const timeout = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [externalLoading, children]);

  return (
    <>
      {(loading || isPending) && <LoadingOverlay />}
      {children}
    </>
  );
}
