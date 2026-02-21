"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  const [count, setCount] = useState(0);

  async function fetchUnreadCount() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${profile}/notificacoes/unread-count`,
        { credentials: "include" },
      );

      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
    }
  }

  useEffect(() => {
    if (profile) {
      fetchUnreadCount();
    }
  }, [profile]);

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
