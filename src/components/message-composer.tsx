"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { sendMessage } from "@/app/actions/messages";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      ref={form}
      action={async (fd) => {
        form.current?.reset();
        await sendMessage(conversationId, fd);
      }}
      className="flex items-end gap-2 rounded-[1.75rem] border border-line bg-surface p-2 shadow-card"
    >
      <label htmlFor="body" className="sr-only">Message</label>
      <textarea
        id="body"
        ref={input}
        name="body"
        rows={1}
        required
        maxLength={2000}
        placeholder="Send a message"
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] [field-sizing:content] focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (input.current?.value.trim()) form.current?.requestSubmit();
          }
        }}
      />
      <button aria-label="Send" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-outback-600 text-white transition hover:bg-outback-700 active:scale-95">
        <ArrowUp className="size-5" strokeWidth={2.5} />
      </button>
    </form>
  );
}

/** Keep the newest message in view when the thread grows. */
export function ScrollToEnd({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end" });
  }, [count]);
  return <div ref={ref} />;
}
