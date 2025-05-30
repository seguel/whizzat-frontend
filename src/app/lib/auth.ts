export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/protected`,
      {
        method: "POST",
        credentials: "include", // ✅ envia cookies HttpOnly
      }
    );

    return res.ok;
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    return false;
  }
}
