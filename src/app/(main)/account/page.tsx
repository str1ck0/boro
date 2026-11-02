import type { Metadata } from "next";
import Link from "next/link";
import { SettingsRow, SettingsSection } from "@/components/settings-list";
import { SignOutButton } from "@/components/sign-out-button";
import { Avatar, HeaderBand } from "@/components/ui";
import { firstName } from "@/lib/format";
import { countPendingRequests } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const pending = await countPendingRequests(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <HeaderBand className="flex items-center gap-5">
        <Link href="/account/profile" aria-label="Change profile photo" className="shrink-0">
          <Avatar src={user.image} name={user.name} size={80} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-4xl font-extrabold tracking-tight text-eureka">{firstName(user.name)}</h1>
          <Link href={`/u/${user.id}`} className="text-[17px] font-medium text-cosmos hover:underline">
            Show Boro profile
          </Link>
        </div>
        <Link href="/account/profile" className="self-end pb-1 text-lg font-bold hover:underline">
          Edit
        </Link>
      </HeaderBand>

      <SettingsSection title="Your Boro">
        <SettingsRow
          href="/my-boro"
          label="Borrowing & lending"
          hint="Requests, bookings and returns"
          badge={
            pending > 0 ? (
              <span className="rounded-full bg-outback px-2 py-0.5 text-xs font-bold text-white">{pending} new</span>
            ) : undefined
          }
        />
        <SettingsRow href="/my-boro?tab=listings" label="My listings" />
        <SettingsRow href="/saved" label="Saved items" />
      </SettingsSection>

      <SettingsSection title="Account settings">
        <SettingsRow href="/account/profile" label="Personal information" hint="Photo, name, suburb and bio" />
        <SettingsRow href="/account/security" label="Login & security" hint={user.email} />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow href="/how-it-works" label="How Boro works" />
        <SettingsRow href="/guidelines" label="Lend & borrow guidelines" />
      </SettingsSection>

      <SignOutButton />
    </div>
  );
}
