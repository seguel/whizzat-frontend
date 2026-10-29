"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { useProfile } from "./ProfileContext";

interface NotificationContextType {
  count: number;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useProfile();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!profile) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${profile}/notificacoes/unread-count`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
    }
  }, [profile]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  return (
    <NotificationContext.Provider value={{ count, refresh: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }

  return context;
}
