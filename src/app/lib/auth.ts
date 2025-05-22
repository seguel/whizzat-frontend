import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies(); // necessário usar await em ambientes edge
  const token = cookieStore.get("token")?.value ?? null;
  return token;
}

export async function fetchWithAuth<T = unknown>(
  endpoint: string
): Promise<T | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
