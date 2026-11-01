import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthForm } from "@/app/components/auth/AuthForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return <AuthForm mode="login" />;
}
