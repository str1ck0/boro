import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { ConversationList } from "@/components/conversation-list";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { listConversations } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Chats" };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const conversations = await listConversations(user.id);
  return (
    <div className="max-w-2xl">
      <AutoRefresh ms={10000} />
      <PageHeader title="Chats" tone="daintree" subtitle="Arrange pick-ups, ask questions, say thanks." />
      {conversations.length ? (
        <ConversationList conversations={conversations} />
      ) : (
        <EmptyState
          icon={<MessagesSquare className="size-10" />}
          title="No chats yet"
          action={<ButtonLink href="/explore">Find something to borrow</ButtonLink>}
        >
          When you request an item or someone asks about yours, the conversation shows up here.
        </EmptyState>
      )}
    </div>
  );
}
