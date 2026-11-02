import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, items, messages } from "@/db/schema";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Find or create the conversation between a borrower and an item's owner. */
export async function ensureConversation(tx: Tx | typeof db, itemId: string, borrowerId: string) {
  const item = await tx.query.items.findFirst({ where: eq(items.id, itemId), columns: { ownerId: true } });
  if (!item) throw new Error("Item not found");
  if (item.ownerId === borrowerId) throw new Error("You can't message yourself");

  const [created] = await tx
    .insert(conversations)
    .values({ itemId, borrowerId, lenderId: item.ownerId })
    .onConflictDoNothing()
    .returning({ id: conversations.id });
  if (created) return created.id;

  const existing = await tx.query.conversations.findFirst({
    where: and(eq(conversations.itemId, itemId), eq(conversations.borrowerId, borrowerId)),
    columns: { id: true },
  });
  return existing!.id;
}

export async function postMessage(
  tx: Tx | typeof db,
  conversationId: string,
  senderId: string | null,
  body: string,
  kind: "text" | "event" = "text",
) {
  const now = new Date();
  await tx.insert(messages).values({ conversationId, senderId, body, kind, createdAt: now });
  const convo = await tx.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    columns: { borrowerId: true },
  });
  // Sending a message marks the thread read for the sender.
  const readField = senderId && convo?.borrowerId === senderId ? { borrowerReadAt: now } : senderId ? { lenderReadAt: now } : {};
  await tx
    .update(conversations)
    .set({ lastMessageAt: now, ...readField })
    .where(eq(conversations.id, conversationId));
}
