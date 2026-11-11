import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ROLE_META } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const [session, params] = await Promise.all([getSessionUser(), searchParams]);
  if (session) redirect(ROLE_META[session.role]?.home ?? "/");

  return (
    <LoginForm
      notice={
        params.registered === "1"
          ? "Account created successfully. Sign in below to submit your first grievance."
          : undefined
      }
    />
  );
}
