import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { db } from "@/db";
import { account } from "@/db/schema";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Field, Input, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Login & security" };

export default async function SecurityPage() {
  const user = await requireUser("/account/security");
  const credential = await db.query.account.findFirst({
    where: and(eq(account.userId, user.id), eq(account.providerId, "credential")),
    columns: { id: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <PageHeader
        title="Login & security"
        tone="eureka"
        subtitle={
          <Link href="/account" className="inline-flex items-center gap-1 font-medium text-cosmos hover:underline">
            <ChevronLeft className="size-4" /> Account
          </Link>
        }
      />
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Email</h2>
        <Field label="Email address" htmlFor="email" hint="This is how you log in. It's never shown to other members.">
          <Input id="email" value={user.email} disabled className="text-muted" />
        </Field>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Password</h2>
        {credential ? (
          <ChangePasswordForm />
        ) : (
          <p className="text-muted">You log in with Google, so there&apos;s no Boro password to change.</p>
        )}
      </section>
    </div>
  );
}
