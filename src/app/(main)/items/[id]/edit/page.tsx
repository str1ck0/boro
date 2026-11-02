import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateItem } from "@/app/actions/items";
import { ItemForm } from "@/components/item-form";
import { PageHeader } from "@/components/ui";
import { getItem } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, item] = await Promise.all([requireUser(`/items/${id}/edit`), getItem(id)]);
  if (!item || item.ownerId !== user.id) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit listing" subtitle={item.title} tone="outback" />
      <ItemForm
        action={updateItem.bind(null, item.id)}
        submitLabel="Save changes"
        initial={{
          title: item.title,
          description: item.description,
          category: item.category,
          suburb: item.suburb,
          pricePerDay: String(item.pricePerDay / 100),
          bond: String(item.bond / 100),
          minDays: String(item.minDays),
          photos: item.photos.map((p) => p.url),
        }}
      />
    </div>
  );
}
