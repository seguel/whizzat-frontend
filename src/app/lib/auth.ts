export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
      method: "GET",
      credentials: "include", // inclui o cookie
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.authenticated === true;
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    return false;
  }
}
