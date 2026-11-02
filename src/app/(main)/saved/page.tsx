import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { ItemGrid } from "@/components/item-card";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { listFavorites } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await requireUser("/saved");
  const items = await listFavorites(user.id);
  return (
    <div>
      <PageHeader title="Saved" subtitle="Things you've got your eye on." tone="outback" />
      {items.length ? (
        <ItemGrid items={items} savedIds={new Set(items.map((i) => i.id))} />
      ) : (
        <EmptyState icon={<Heart className="size-10" />} title="Nothing saved yet" action={<ButtonLink href="/explore">Start exploring</ButtonLink>}>
          Tap the heart on anything you like and it&apos;ll wait for you here.
        </EmptyState>
      )}
    </div>
  );
}
