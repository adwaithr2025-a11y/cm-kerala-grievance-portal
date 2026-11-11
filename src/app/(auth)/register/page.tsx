import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ROLE_META } from "@/lib/constants";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create a citizen account" };

export default async function RegisterPage() {
  const session = await getSessionUser();
  if (session) redirect(ROLE_META[session.role]?.home ?? "/");
  return <RegisterForm />;
}
