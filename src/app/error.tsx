"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-extrabold">Something went wrong</h1>
      <p className="text-muted">Sorry about that — please try again.</p>
      <button onClick={reset} className="rounded-full bg-cosmos px-6 py-3 font-semibold text-white">
        Try again
      </button>
    </main>
  );
}
