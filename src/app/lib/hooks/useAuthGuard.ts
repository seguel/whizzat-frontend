"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isUserAuthenticated } from "../auth";

export function useAuthGuard(redirectTo: string = "/cadastro/login") {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isUserAuthenticated();

        if (!auth) {
          setIsAuthenticated(false);

          const encodedPath = encodeURIComponent(pathname);
          router.replace(`${redirectTo}?redirect=${encodedPath}`);
        } else {
          setIsAuthenticated(true);
        }
      } finally {
        // 🔑 SEMPRE finaliza o loading
        setIsReady(true);
      }
    };

    checkAuth();
  }, [redirectTo, pathname, router]);

  return { isReady, isAuthenticated };
}
