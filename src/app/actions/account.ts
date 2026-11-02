"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
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
  await requireUser("/account/profile");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: formValues(formData) };
  const { name, suburb, bio, image } = parsed.data;
  // Go through Better Auth so it also refreshes the cached session cookie;
  // otherwise the header and account pages show the old name/photo for a few minutes.
  await auth.api.updateUser({
    headers: await headers(),
    body: { name, suburb: suburb || null, bio: bio || null, image: image || null },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
