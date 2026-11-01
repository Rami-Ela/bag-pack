import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { TemplatesManager } from "@/app/components/templates/TemplatesManager";

export default async function TemplatesPage() {
  if (!(await getCurrentUser())) redirect("/login");
  return <TemplatesManager />;
}
