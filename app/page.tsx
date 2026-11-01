import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { TripsApp } from "@/app/components/trips/TripsApp";

export default async function Home() {
  if (!(await getCurrentUser())) redirect("/login");
  return <TripsApp />;
}
