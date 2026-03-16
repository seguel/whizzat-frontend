"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  initials: string;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

function getInitials(nome: string) {
  const parts = nome.trim().split(" ");

  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initials, setInitials] = useState("?");

  async function fetchUser() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setInitials(getInitials(data.nome));
      }
    } catch (err) {
      console.error("Erro ao buscar usuário", err);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        initials,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}
