import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("/account");
  const { welcome } = await searchParams;
  const links = [
    { href: `/u/${user.id}`, label: "View my public profile" },
    { href: "/saved", label: "Saved items" },
    { href: "/how-it-works", label: "How Boro works" },
    { href: "/guidelines", label: "Lend & borrow guidelines" },
  ];
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="max-w-xl">
        {welcome ? (
          <PageHeader title="Welcome to Boro!" subtitle="Add a photo and your suburb — lenders are much more likely to say yes." tone="outback" />
        ) : (
          <PageHeader title="Account" subtitle="Your profile is what lenders see when you ask to borrow." tone="eureka" />
        )}
        <ProfileForm
          name={user.name}
          email={user.email}
          suburb={(user as { suburb?: string | null }).suburb ?? ""}
          bio={(user as { bio?: string | null }).bio ?? ""}
          image={user.image ?? null}
        />
      </div>
      <aside className="space-y-6 lg:pt-20">
        <ul className="divide-y divide-line rounded-card bg-mist">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex items-center justify-between px-5 py-4 font-medium hover:text-cosmos">
                {l.label} <ChevronRight className="size-4 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
        <SignOutButton />
      </aside>
    </div>
  );
}
