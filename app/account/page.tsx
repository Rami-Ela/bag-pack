import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AccountView } from "@/app/components/auth/AccountView";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AccountView email={user.email} />;
}
