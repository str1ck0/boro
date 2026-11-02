"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { ensureConversation, postMessage } from "@/lib/chat";
import { requireUser } from "@/lib/session";

export async function startConversation(itemId: string, formData: FormData) {
  const user = await requireUser(`/items/${itemId}`);
  const body = z.string().trim().max(2000).safeParse(formData.get("body"));
  const id = await ensureConversation(db, itemId, user.id);
  if (body.success && body.data) await postMessage(db, id, user.id, body.data);
  revalidatePath("/messages", "layout");
  redirect(`/messages/${id}`);
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const user = await requireUser();
  const body = z.string().trim().min(1).max(2000).safeParse(formData.get("body"));
  if (!body.success) return;

  const convo = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      or(eq(conversations.borrowerId, user.id), eq(conversations.lenderId, user.id)),
    ),
    columns: { id: true },
  });
  if (!convo) return;

  await postMessage(db, conversationId, user.id, body.data);
  revalidatePath("/messages", "layout");
}

export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  const now = new Date();
  await db
    .update(conversations)
    .set({ borrowerReadAt: now })
    .where(and(eq(conversations.id, conversationId), eq(conversations.borrowerId, user.id)));
  await db
    .update(conversations)
    .set({ lenderReadAt: now })
    .where(and(eq(conversations.id, conversationId), eq(conversations.lenderId, user.id)));
}
