"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  if (sent) {
    return (
      <div className="space-y-4">
        <MailCheck className="size-10 text-daintree" />
        <h1 className="text-3xl font-extrabold tracking-tight">Check your inbox</h1>
        <p className="text-muted">
          If there&apos;s a Boro account for that email, we&apos;ve sent a link to choose a new password. It expires in an hour —
          check your spam folder if it doesn&apos;t turn up.
        </p>
        <Link href="/sign-in" className="inline-block font-semibold text-cosmos hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Forgot your password?</h1>
        <p className="mt-1 text-muted">Enter your email and we&apos;ll send you a link to choose a new one.</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(undefined);
          const email = String(new FormData(e.currentTarget).get("email"));
          const res = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
          setPending(false);
          if (res.error) setError("We couldn't send the email just now. Please try again in a minute.");
          else setSent(true);
        }}
      >
        <Field label="Email address" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        {error && <p className="rounded-2xl bg-outback-50 p-3 text-sm font-medium text-outback" role="alert">{error}</p>}
        <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="text-center text-[15px] text-muted">
        Remembered it? <Link href="/sign-in" className="font-semibold text-cosmos hover:underline">Log in</Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const invalid = !token || params.get("error") === "INVALID_TOKEN";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  if (invalid) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">That link has expired</h1>
        <p className="text-muted">Reset links only work once and last an hour. Request a fresh one and you&apos;ll be back in.</p>
        <Link href="/forgot-password" className="inline-block font-semibold text-cosmos hover:underline">
          Send a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Choose a new password</h1>
        <p className="mt-1 text-muted">At least 8 characters. You&apos;ll be logged out everywhere else.</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const newPassword = String(fd.get("password"));
          if (newPassword !== String(fd.get("confirm"))) {
            setError("Those passwords don't match.");
            return;
          }
          setPending(true);
          setError(undefined);
          const res = await authClient.resetPassword({ newPassword, token });
          setPending(false);
          if (res.error) {
            setError(res.error.message ?? "That link has expired — request a new one.");
            return;
          }
          router.push("/sign-in?reset=1");
        }}
      >
        <Field label="New password" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm">
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        {error && <p className="rounded-2xl bg-outback-50 p-3 text-sm font-medium text-outback" role="alert">{error}</p>}
        <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
