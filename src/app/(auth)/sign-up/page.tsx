import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { googleEnabled } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Join Boro" };

export default async function Page() {
  if (await getCurrentUser()) redirect("/");
  return (
    <Suspense>
      <AuthForm mode="sign-up" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
