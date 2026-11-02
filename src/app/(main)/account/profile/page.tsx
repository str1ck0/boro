import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Personal information" };

export default async function ProfileSettingsPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("/account/profile");
  const { welcome } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      {welcome ? (
        <PageHeader title="Welcome to Boro!" subtitle="Add a photo and your suburb — lenders are much more likely to say yes." tone="outback" />
      ) : (
        <PageHeader
          title="Personal information"
          subtitle={<BackLink />}
          tone="eureka"
        />
      )}
      <ProfileForm
        name={user.name}
        email={user.email}
        suburb={(user as { suburb?: string | null }).suburb ?? ""}
        bio={(user as { bio?: string | null }).bio ?? ""}
        image={user.image ?? null}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/account" className="inline-flex items-center gap-1 font-medium text-cosmos hover:underline">
      <ChevronLeft className="size-4" /> Account
    </Link>
  );
}
