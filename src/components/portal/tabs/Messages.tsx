import { useEffect, useMemo, useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import { cn } from "@/lib/utils";
import { Paperclip, Search, Send } from "lucide-react";

export function Messages() {
  const { messages, sendMessage, contacts } = usePortal();
  const [activeId, setActiveId] = useState<string>(contacts[0]?.id ?? "");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = contacts.find((c) => c.id === activeId) ?? contacts[0];
  const thread = useMemo(
    () => messages.filter((m) => m.contactId === active?.id),
    [messages, active?.id],
  );
  const filteredContacts = useMemo(
    () =>
      contacts.filter((c) =>
        (c.name + " " + c.role).toLowerCase().includes(query.toLowerCase()),
      ),
    [contacts, query],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length, active?.id]);

  const submit = () => {
    const v = text.trim();
    if (!v || !active) return;
    sendMessage(active.id, v);
    setText("");
  };

  const lastMessage = (id: string) => {
    const list = messages.filter((m) => m.contactId === id);
    return list[list.length - 1];
  };

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-[260px_1fr] overflow-hidden rounded-lg border bg-card">
      {/* Contacts list */}
      <aside className="flex flex-col border-r bg-background">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="w-full rounded-md border bg-background py-1.5 pl-7 pr-2 text-xs outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((c) => {
            const last = lastMessage(c.id);
            const isActive = c.id === active?.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-accent",
                  isActive && "bg-accent",
                )}
              >
                <div className="relative shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                      c.online ? "bg-emerald-500" : "bg-muted-foreground",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    {(c.unread ?? 0) > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {c.role}
                    {last && " · " + last.text}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat window */}
      <section className="flex min-w-0 flex-col">
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {active.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card",
                    active.online ? "bg-emerald-500" : "bg-muted-foreground",
                  )}
                />
              </div>
              <div>
                <div className="text-sm font-semibold">{active.name}</div>
                <div className="text-xs text-muted-foreground">
                  {active.online ? "Online" : "Offline"} · {active.role}
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  No messages yet — say hi!
                </p>
              )}
              {thread.map((m) => {
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
                      <div className={cn("mt-0.5 text-[10px] text-muted-foreground", mine ? "text-right" : "text-left")}>
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
                placeholder={`Message ${active.name}…`}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={submit}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a contact to start chatting
          </div>
        )}
      </section>
    </div>
  );
}