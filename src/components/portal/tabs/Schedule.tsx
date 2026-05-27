import { useMemo, useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { EventType, ScheduleEvent } from "@/lib/portal-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bell, ExternalLink, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const FILTERS: ("All" | EventType)[] = ["All", "Counselling", "Test Prep", "Profile Building"];

function dotClass(t: EventType) {
  return t === "Counselling"
    ? "bg-blue-500"
    : t === "Test Prep"
      ? "bg-purple-500"
      : "bg-emerald-500";
}

export function Schedule() {
  const { events, uploadEventAssignment } = usePortal();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(
    () =>
      events
        .filter((e) => (filter === "All" ? true : e.type === filter))
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, filter],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent",
            )}
          >
            {f === "All" ? "All Events" : f}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border md:left-4" aria-hidden />
        <ol className="space-y-5">
          {list.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              onUpload={(name) => {
                uploadEventAssignment(e.id, name);
                toast.success(`Uploaded "${name}". Task & assignment synced.`);
              }}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

function EventRow({
  event,
  onUpload,
}: {
  event: ScheduleEvent;
  onUpload: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const start = new Date(event.start);
  const end = new Date(event.end);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <li className="relative pl-9 md:pl-12">
      <span
        className={cn(
          "absolute left-1.5 top-3 h-3 w-3 rounded-full ring-4 ring-background md:left-2.5",
          dotClass(event.type),
          event.status === "Upcoming" && "animate-pulse",
        )}
      />
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {event.type}
            </div>
            <h3 className="text-base font-semibold">{event.title}</h3>
            <div className="text-xs text-muted-foreground">
              {dateStr} · {timeStr}
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              event.status === "Upcoming"
                ? "bg-primary/10 text-primary animate-pulse"
                : "bg-muted text-muted-foreground",
            )}
          >
            {event.status}
          </span>
        </div>

        {event.agenda.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-muted-foreground">Agenda</div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              {event.agenda.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {event.assignment && (
          <div className="mt-3 rounded-md border bg-muted/40 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Required Assignment
            </div>
            <div className="font-medium">{event.assignment.title}</div>
            <p className="text-sm text-muted-foreground">{event.assignment.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f.name);
                }}
              />
              <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                <UploadCloud className="mr-1 h-4 w-4" />
                {event.assignment.fileName ? "Replace File" : "Upload File"}
              </Button>
              {event.assignment.fileName ? (
                <span className="text-xs text-emerald-700">✓ {event.assignment.fileName}</span>
              ) : (
                <span className="text-xs text-amber-700">Pending</span>
              )}
            </div>
          </div>
        )}

        {event.status === "Upcoming" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success("Reminder set for " + dateStr)}
            >
              <Bell className="mr-1 h-4 w-4" /> Set Reminder
            </Button>
            {event.meetingLink && (
              <Button size="sm" asChild>
                <a href={event.meetingLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" /> Join Meeting
                </a>
              </Button>
            )}
          </div>
        )}
      </Card>
    </li>
  );
}