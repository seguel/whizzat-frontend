"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isUserAuthenticated } from "../auth";

export function useAuthGuard(redirectTo: string = "/cadastro/login") {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    isUserAuthenticated().then((auth) => {
      if (!auth) {
        const encodedPath = encodeURIComponent(pathname);
        router.replace(`${redirectTo}?redirect=${encodedPath}`);
      } else {
        setIsReady(true);
      }
    });
  }, [redirectTo, pathname, router]);

  return { isReady };
}
