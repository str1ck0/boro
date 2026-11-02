import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { createItem } from "@/app/actions/items";
import { ItemForm } from "@/components/item-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Lend an item" };

export default async function LendPage() {
  const user = await requireUser("/lend");
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="max-w-2xl">
        <PageHeader title="Lend an item" subtitle="Add a listing to Boro — it takes about two minutes." tone="outback" />
        <ItemForm
          action={createItem}
          submitLabel="Publish listing"
          initial={{ title: "", description: "", category: "", suburb: user.suburb ?? "", pricePerDay: "", bond: "0", minDays: "1", photos: [] }}
        />
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4 rounded-card bg-eureka-50 p-6">
          <Lightbulb className="size-7 text-eureka" />
          <h2 className="font-bold">Tips for a great listing</h2>
          <ul className="space-y-3 text-sm text-ink/80">
            <li><strong>Daylight photos</strong> from a few angles get the most requests.</li>
            <li><strong>Price it at 5–10%</strong> of what it costs new, per day. Discount longer hires in chat.</li>
            <li><strong>A bond</strong> gives you peace of mind for pricier gear. Arrange it at pick-up.</li>
            <li><strong>Say what&apos;s included</strong> — paddles, batteries, chargers, cases.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
