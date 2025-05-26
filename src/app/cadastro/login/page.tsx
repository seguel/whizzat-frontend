import { redirect } from "next/navigation";
import { getAuthToken } from "../../lib/auth"; // ajuste o caminho conforme necessário
import LoginPage from "./LoginForm";

export default async function Home() {
  const token = await getAuthToken();

  if (token) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
