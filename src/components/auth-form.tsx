"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function AuthForm({ mode, googleEnabled }: { mode: "sign-in" | "sign-up"; googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const res =
      mode === "sign-up"
        ? await signUp.email({ email, password, name: String(fd.get("name")).trim() })
        : await signIn.email({ email, password });
    if (res.error) {
      setPending(false);
      setError(
        res.error.status === 401
          ? "That email and password don't match."
          : res.error.code === "USER_ALREADY_EXISTS" || res.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? "There's already an account with that email — try logging in."
            : (res.error.message ?? "Something went wrong. Please try again."),
      );
      return;
    }
    router.push(mode === "sign-up" && next === "/" ? "/account?welcome=1" : next);
    router.refresh();
  }

  const other = mode === "sign-in" ? "sign-up" : "sign-in";
  const otherHref = `/${other}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {mode === "sign-in" ? "Welcome back" : "Join Boro"}
        </h1>
        <p className="mt-1 text-muted">
          {mode === "sign-in" ? "Log in to borrow, lend and chat." : "It's free. Borrow from neighbours, lend what you're not using."}
        </p>
      </div>

      {googleEnabled && (
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => signIn.social({ provider: "google", callbackURL: next })}
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted">
            <hr className="flex-1 border-line" /> or <hr className="flex-1 border-line" />
          </div>
        </>
      )}

      {params.get("reset") && (
        <p className="rounded-2xl bg-daintree-50 p-3 text-sm font-medium text-daintree">
          Password updated — log in with your new one.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <Field label="Full name" htmlFor="name">
            <Input id="name" name="name" autoComplete="name" required minLength={2} />
          </Field>
        )}
        <Field label="Email address" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={
            mode === "sign-up" ? (
              "At least 8 characters."
            ) : (
              <Link href="/forgot-password" className="font-semibold text-cosmos hover:underline">
                Forgot password?
              </Link>
            )
          }
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
              minLength={8}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-outback hover:bg-outback-50"
            >
              {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </Field>
        {error && <p className="rounded-2xl bg-outback-50 p-3 text-sm font-medium text-outback" role="alert">{error}</p>}
        <Button type="submit" variant={mode === "sign-in" ? "secondary" : "primary"} size="lg" className="w-full" disabled={pending}>
          {pending ? "One sec…" : mode === "sign-in" ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-[15px] text-muted">
        {mode === "sign-in" ? "New here? " : "Already a member? "}
        <Link href={otherHref} className="font-semibold text-cosmos hover:underline">
          {mode === "sign-in" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
