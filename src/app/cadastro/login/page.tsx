import { redirect } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import LoginPage from "./LoginForm";

export default async function LoginPageWrapper() {
  const isAuthenticated = await isUserAuthenticated();

  if (isAuthenticated) {
    redirect("/cadastro/perfil");
  }

  return <LoginPage />;
}
