import { redirect } from "next/navigation";
import LoginPage from "./LoginForm";
import { isUserAuthenticated } from "../../lib/auth";

export default async function Home() {
  const isAuthenticated = await isUserAuthenticated();

  if (isAuthenticated) {
    redirect("/cadastro/perfil");
  }

  return <LoginPage />;
}
