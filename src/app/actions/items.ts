"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { favorites, itemPhotos, items } from "@/db/schema";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { isOwnPhotoUrl } from "@/lib/photo-url";
import { fieldErrors, formValues, type FormState } from "@/lib/form";
import { getCurrentUser, requireUser } from "@/lib/session";

const rand = (label: string, max: number) =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .min(0, `${label} can't be negative`)
    .max(max, `${label} looks too high`)
    .transform((v) => Math.round(v * 100));

const photoUrl = z.string().refine(isOwnPhotoUrl, "Invalid photo");

const itemSchema = z.object({
  title: z.string().trim().min(3, "Give it a short, clear title").max(80),
  description: z.string().trim().min(20, "Add a little more detail (at least 20 characters)").max(2000),
  category: z.enum(CATEGORY_SLUGS, { message: "Pick a category" }),
  suburb: z.string().trim().min(2, "Where can it be picked up?").max(60),
  pricePerDay: rand("Price", 100_000).refine((c) => c >= 1000, "Minimum is R10 a day"),
  bond: rand("Bond", 500_000),
  minDays: z.coerce.number().int().min(1).max(60),
  photos: z.array(photoUrl).min(1, "Add at least one photo").max(8, "Up to 8 photos"),
});

function parse(formData: FormData) {
  return itemSchema.safeParse({
    ...Object.fromEntries(formData),
    photos: formData.getAll("photos"),
  });
}

export async function createItem(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/lend");
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: formValues(formData) };
  }
  const { photos, ...data } = parsed.data;

  const id = await db.transaction(async (tx) => {
    const [item] = await tx.insert(items).values({ ...data, ownerId: user.id }).returning({ id: items.id });
    await tx.insert(itemPhotos).values(photos.map((url, position) => ({ itemId: item.id, url, position })));
    return item.id;
  });

  revalidatePath("/", "layout");
  redirect(`/items/${id}?listed=1`);
}

export async function updateItem(itemId: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: formValues(formData) };
  }
  const { photos, ...data } = parsed.data;

  const updated = await db.transaction(async (tx) => {
    const res = await tx
      .update(items)
      .set(data)
      .where(and(eq(items.id, itemId), eq(items.ownerId, user.id)))
      .returning({ id: items.id });
    if (!res.length) return false;
    await tx.delete(itemPhotos).where(eq(itemPhotos.itemId, itemId));
    await tx.insert(itemPhotos).values(photos.map((url, position) => ({ itemId, url, position })));
    return true;
  });
  if (!updated) return { error: "You can only edit your own listings." };

  revalidatePath("/", "layout");
  redirect(`/items/${itemId}`);
}

export async function setItemStatus(itemId: string, status: "active" | "paused") {
  const user = await requireUser();
  await db
    .update(items)
    .set({ status })
    .where(and(eq(items.id, itemId), eq(items.ownerId, user.id)));
  revalidatePath("/", "layout");
}

export async function deleteItem(itemId: string) {
  const user = await requireUser();
  await db.delete(items).where(and(eq(items.id, itemId), eq(items.ownerId, user.id)));
  revalidatePath("/", "layout");
  redirect("/my-boro?tab=listings");
}

export async function toggleFavorite(itemId: string): Promise<{ saved: boolean } | { error: "auth" }> {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  const deleted = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.itemId, itemId)))
    .returning();
  if (!deleted.length) {
    await db.insert(favorites).values({ userId: user.id, itemId }).onConflictDoNothing();
  }
  revalidatePath("/saved");
  return { saved: !deleted.length };
}
