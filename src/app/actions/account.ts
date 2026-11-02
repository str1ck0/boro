"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { user as users } from "@/db/schema";
import { isOwnPhotoUrl } from "@/lib/photo-url";
import { fieldErrors, formValues, type FormState } from "@/lib/form";
import { requireUser } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().trim().min(2, "What should people call you?").max(60),
  suburb: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(600).optional(),
  image: z
    .string()
    .refine((u) => !u || isOwnPhotoUrl(u))
    .optional(),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser("/account");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: formValues(formData) };
  const { name, suburb, bio, image } = parsed.data;
  await db
    .update(users)
    .set({ name, suburb: suburb || null, bio: bio || null, image: image || null })
    .where(eq(users.id, me.id));
  revalidatePath("/", "layout");
  return { ok: true };
}
