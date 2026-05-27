import { useEffect, useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import { cn } from "@/lib/utils";
import { Paperclip, Send } from "lucide-react";

export function Messages() {
  const { messages, sendMessage, counselor } = usePortal();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    sendMessage(v);
    setText("");
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {counselor.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card",
              counselor.online ? "bg-emerald-500" : "bg-muted-foreground",
            )}
          />
        </div>
        <div>
          <div className="text-sm font-semibold">{counselor.name}</div>
          <div className="text-xs text-muted-foreground">
            {counselor.online ? "Online" : "Offline"} · Counselor
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.from === "student";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%]", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-[10px] text-muted-foreground",
                    mine ? "text-right" : "text-left",
                  )}
                >
                  {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t bg-background p-3">
        <button className="rounded-md p-2 text-muted-foreground hover:bg-accent" aria-label="Attach">
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={submit}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}