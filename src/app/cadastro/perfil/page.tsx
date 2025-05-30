import { redirect } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import PerfilForm from "./PerfilForm";

export default async function PerfilPage() {
  const isAuthenticated = await isUserAuthenticated();

  if (!isAuthenticated) {
    redirect("/");
  }

  return <PerfilForm />;
}
