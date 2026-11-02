import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { shortDate } from "@/lib/format";
import type { listConversations } from "@/lib/queries";

type Convo = Awaited<ReturnType<typeof listConversations>>[number];

export function ConversationList({ conversations, activeId }: { conversations: Convo[]; activeId?: string }) {
  return (
    <ul className="divide-y divide-line">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link
            href={`/messages/${c.id}`}
            aria-current={c.id === activeId ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-2xl px-3 py-4 transition hover:bg-surface", c.id === activeId && "bg-surface shadow-card")}
          >
            <div className="relative shrink-0">
              <Avatar src={c.otherImage} name={c.otherName} size={52} />
              {c.itemPhoto && (
                <Image src={c.itemPhoto} alt="" width={24} height={24} className="absolute -bottom-1 -right-1 size-6 rounded-md border-2 border-canvas object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn("truncate", c.unread ? "font-extrabold" : "font-bold")}>{c.otherName}</p>
                <span className={cn("shrink-0 text-xs", c.unread ? "font-bold text-daintree-700" : "text-muted")}>{shortDate(c.lastMessageAt)}</span>
              </div>
              <p className="truncate text-sm font-medium text-ink/80">{c.itemTitle}</p>
              <p className={cn("truncate text-sm", c.unread ? "font-semibold text-ink" : "text-muted")}>{c.lastMessage ?? "No messages yet"}</p>
            </div>
            {c.unread && <span className="size-2.5 shrink-0 rounded-full bg-daintree" aria-label="Unread" />}
          </Link>
        </li>
      ))}
    </ul>
  );
}
