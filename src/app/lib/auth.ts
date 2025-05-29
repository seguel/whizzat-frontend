import { headers } from "next/headers";

export async function isUserAuthenticated(): Promise<boolean> {
  const headersList = await headers(); // ✅
  const cookie = headersList.get("cookie") ?? "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/protected`, {
    method: "POST",
    credentials: "include",
    headers: {
      cookie,
    },
    cache: "no-store",
  });

  return res.ok;
}
