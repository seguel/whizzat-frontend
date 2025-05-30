import { cookies } from "next/headers";

export async function isUserAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return false;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/protected`,
      {
        method: "POST",
        headers: {
          Cookie: `token=${token}`, // ← passa o cookie diretamente
        },
        cache: "no-store", // sempre validar com backend
      }
    );

    return res.ok;
  } catch {
    return false;
  }
}
