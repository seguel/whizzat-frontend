import { cookies } from "next/headers";

export async function isUserAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return false;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/protected`, {
    method: "POST",
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store",
  });

  return res.ok;
}
