"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const newPassword = String(fd.get("newPassword"));
        if (newPassword !== String(fd.get("confirm"))) {
          setError("Those new passwords don't match.");
          return;
        }
        setPending(true);
        setError(undefined);
        setDone(false);
        const res = await authClient.changePassword({
          currentPassword: String(fd.get("currentPassword")),
          newPassword,
          revokeOtherSessions: true,
        });
        setPending(false);
        if (res.error) {
          setError(
            res.error.code === "INVALID_PASSWORD" ? "Your current password isn't right." : (res.error.message ?? "Couldn't change your password."),
          );
          return;
        }
        form.reset();
        setDone(true);
      }}
    >
      <Field label="Current password" htmlFor="currentPassword">
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      {error && <p className="rounded-2xl bg-outback-50 p-3 text-sm font-medium text-outback" role="alert">{error}</p>}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Change password"}</Button>
        {done && (
          <span className="inline-flex items-center gap-1 font-semibold text-daintree">
            <Check className="size-4" /> Password changed — other devices were logged out
          </span>
        )}
      </div>
    </form>
  );
}
