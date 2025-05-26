import { redirect } from "next/navigation";
import { fetchWithAuth } from "../lib/auth";
import LogoutButton from "../components/LogoutButton";

type Usuario = {
  id: number;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
};

export default async function DashboardPage() {
  const data = await fetchWithAuth<{ usuario: Usuario }>("/auth/perfil");

  if (!data || !data.usuario) {
    //redirect("/cadastro/login");
    redirect("/");
  }

  const { usuario } = data;

  return (
    <main className="p-10">
      <LogoutButton />
      <h1 className="text-2xl font-bold">
        Olá, {usuario.primeiro_nome} {usuario.ultimo_nome}!
      </h1>
      <p className="mt-4 text-gray-600">
        Seu email é <strong>{usuario.email}</strong>.
      </p>
    </main>
  );
}
