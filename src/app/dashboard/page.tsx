import { redirect } from "next/navigation";
import { isUserAuthenticated } from "../lib/auth";
import LogoutButton from "../components/LogoutButton";

/* type Usuario = {
  id: number;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
};
 */
export default async function DashboardPage() {
  const isAuthenticated = await isUserAuthenticated();

  if (!isAuthenticated) {
    redirect("/");
  }

  const data = {
    primeiro_nome: "Alejandro",
    ultimo_nome: "Seguel",
    email: "ariel.alejandrocs@gmail.com",
  };

  return (
    <main className="p-10">
      <LogoutButton />
      <h1 className="text-2xl font-bold">
        Olá, {data.primeiro_nome} {data.ultimo_nome}!
      </h1>
      <p className="mt-4 text-gray-600">
        Seu email é <strong>{data.email}</strong>.
      </p>
    </main>
  );
}
