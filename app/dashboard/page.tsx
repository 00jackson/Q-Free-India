import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_client";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const adminAuth = (await cookieStore).get("admin_auth");

  if (!adminAuth) {
    redirect("/dashboard/login");
  }

  return <DashboardClient />;
}