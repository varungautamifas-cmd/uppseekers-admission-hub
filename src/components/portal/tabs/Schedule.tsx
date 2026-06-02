import { useMemo, useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { Batch, EventType, ScheduleEvent } from "@/lib/portal-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarPlus,
  ExternalLink,
  Paperclip,
  Plus,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

const FILTERS: ("All" | EventType)[] = ["All", "Counselling", "Test Prep", "Profile Building", "Research"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dotClass(t: EventType) {
  return t === "Counselling"
    ? "bg-blue-500"
    : t === "Test Prep"
      ? "bg-purple-500"
      : t === "Profile Building"
        ? "bg-emerald-500"
        : "bg-rose-500";
}

export function Schedule() {
  const { events, uploadEventAssignment, updateEvent, createBatch, batches, updateBatch } = usePortal();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      events
        .filter((e) => (filter === "All" ? true : e.type === filter))
        .filter((e) => {
          const s = new Date(e.start).getTime();
          if (from && s < new Date(from).getTime()) return false;
          if (to && s > new Date(to).getTime() + 86_400_000) return false;
          return true;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, filter, from, to],
  );

  const detail = detailId ? events.find((e) => e.id === detailId) ?? null : null;

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-end gap-3 p-3">
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
        <div>
          <Label className="text-[11px]">From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-8 w-[150px]" />
        </div>
        <div>
          <Label className="text-[11px]">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-8 w-[150px]" />
        </div>
        {(from || to) && (
          <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo(""); }}>
            Clear Dates
          </Button>
        )}
        <div className="ml-auto">
          <Button size="sm" onClick={() => setBatchOpen(true)}>
            <CalendarPlus className="mr-1 h-4 w-4" /> Create Batch
          </Button>
        </div>
      </Card>

      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border md:left-4" aria-hidden />
        <ol className="space-y-5">
          {list.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              onOpen={() => setDetailId(e.id)}
              onUpload={(name) => {
                uploadEventAssignment(e.id, name);
                toast.success(`Uploaded "${name}". Task & assignment synced.`);
              }}
            />
          ))}
          {list.length === 0 && (
            <li className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
              No events match the current filters.
            </li>
          )}
        </ol>
      </div>

      <CreateBatchDialog
        open={batchOpen}
        onOpenChange={setBatchOpen}
        onCreate={(b) => {
          createBatch(b);
          toast.success(`Batch "${b.name}" created — sessions generated.`);
        }}
      />

      {batches.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Manage Batches</h3>
          <div className="space-y-2">
            {batches.map((b) => (
              <BatchRow key={b.id} batch={b} onUpdate={(patch) => updateBatch(b.id, patch)}
                onEditFull={() => setEditBatchId(b.id)} />
            ))}
          </div>
        </Card>
      )}

      <CreateBatchDialog
        key={editBatchId ?? "new"}
        open={!!editBatchId}
        onOpenChange={(o) => !o && setEditBatchId(null)}
        initial={batches.find((b) => b.id === editBatchId) ?? null}
        onCreate={(b) => {
          if (editBatchId) updateBatch(editBatchId, b);
          setEditBatchId(null);
          toast.success("Batch updated");
        }}
      />

      <EventDetailDialog
        event={detail}
        onClose={() => setDetailId(null)}
        onUpdate={(patch) => detail && updateEvent(detail.id, patch)}
      />
    </div>
  );
}

function BatchRow({ batch, onUpdate, onEditFull }: {
  batch: Batch;
  onUpdate: (patch: Partial<Batch>) => void;
  onEditFull: () => void;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 rounded-md border p-2 md:grid-cols-[2fr_1fr_2fr_auto]">
      <Input value={batch.name} onChange={(e) => onUpdate({ name: e.target.value })}
        className="h-8" placeholder="Batch name" />
      <Select value={batch.type} onValueChange={(v) => onUpdate({ type: v as EventType })}>
        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Counselling">Counselling</SelectItem>
          <SelectItem value="Test Prep">Test Prep</SelectItem>
          <SelectItem value="Profile Building">Profile Building</SelectItem>
          <SelectItem value="Research">Research</SelectItem>
        </SelectContent>
      </Select>
      <Input value={batch.meetingLink ?? ""} onChange={(e) => onUpdate({ meetingLink: e.target.value })}
        className="h-8" placeholder="Meeting link" />
      <Button size="sm" variant="outline" onClick={onEditFull}>Edit Full</Button>
    </div>
  );
}

function EventRow({
  event,
  onOpen,
  onUpload,
}: {
  event: ScheduleEvent;
  onOpen: () => void;
  onUpload: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const start = new Date(event.start);
  const end = new Date(event.end);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const isPast = end.getTime() < Date.now();
  const needsRating = isPast && event.rating === undefined;

  return (
    <li className="relative pl-9 md:pl-12">
      <span
        className={cn(
          "absolute left-1.5 top-3 h-3 w-3 rounded-full ring-4 ring-background md:left-2.5",
          dotClass(event.type),
          event.status === "Upcoming" && "animate-pulse",
        )}
      />
      <Card className="cursor-pointer p-4 transition-shadow hover:shadow-sm" onDoubleClick={onOpen} title="Double-click for notes, files, reminders">
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
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
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
              onClick={(e) => {
                e.stopPropagation();
                toast.success("Reminder set for " + dateStr);
              }}
            >
              <Bell className="mr-1 h-4 w-4" /> Set Reminder
            </Button>
            {event.meetingLink && (
              <Button size="sm" asChild onClick={(e) => e.stopPropagation()}>
                <a href={event.meetingLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" /> Join Meeting
                </a>
              </Button>
            )}
          </div>
        )}

        {needsRating && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs">
            <div className="font-medium text-amber-800">Did you attend this session?</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-amber-700">Rate it:</span>
              <RatingStars value={0} onChange={(r) => onOpen()} />
              <span className="text-amber-700">(Double-click to add notes too)</span>
            </div>
          </div>
        )}
        {event.rating !== undefined && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Your rating:</span>
            <RatingStars value={event.rating} onChange={() => {}} readOnly />
          </div>
        )}
      </Card>
    </li>
  );
}

function RatingStars({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={(e) => {
            e.stopPropagation();
            onChange(n);
          }}
          className={cn("p-0.5", readOnly && "cursor-default")}
          aria-label={`${n} star`}
        >
          <Star
            className={cn(
              "h-4 w-4",
              n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function CreateBatchDialog({
  open,
  onOpenChange,
  onCreate,
  initial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (b: Batch) => void;
  initial?: Batch | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "Test Prep");
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [1, 3]);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "15:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "16:30");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [meetingLink, setMeetingLink] = useState(initial?.meetingLink ?? "");
  const [pointsText, setPointsText] = useState((initial?.discussionPoints ?? []).join("\n"));

  const reset = () => {
    setName(""); setType("Test Prep"); setWeekdays([1, 3]);
    setStartTime("15:00"); setEndTime("16:30");
    setStartDate(""); setEndDate(""); setMeetingLink(""); setPointsText("");
  };

  const toggleDay = (d: number) =>
    setWeekdays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort()));

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Batch Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="e.g., SAT Math Mastery" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Counselling">Counselling</SelectItem>
                  <SelectItem value="Test Prep">Test Prep</SelectItem>
                  <SelectItem value="Profile Building">Profile Building</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Weekly Days</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {WEEKDAYS.map((w, i) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium",
                    weekdays.includes(i)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-accent",
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Meeting Link (optional)</Label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="mt-1.5" placeholder="https://meet.google.com/..." />
          </div>
          <div>
            <Label>Discussion Points — one per line (cycled across sessions)</Label>
            <Textarea
              value={pointsText}
              onChange={(e) => setPointsText(e.target.value)}
              rows={4}
              className="mt-1.5"
              placeholder={"Week 1: Algebra fundamentals\nWeek 2: Linear systems\nWeek 3: Quadratics"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name || !startDate || !endDate || weekdays.length === 0}
            onClick={() => {
              onCreate({
                id: `b${Date.now()}`,
                name,
                type,
                weekdays,
                startTime,
                endTime,
                startDate,
                endDate,
                meetingLink: meetingLink || undefined,
                discussionPoints: pointsText.split("\n").map((s) => s.trim()).filter(Boolean),
              });
              onOpenChange(false);
              reset();
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventDetailDialog({
  event,
  onClose,
  onUpdate,
}: {
  event: ScheduleEvent | null;
  onClose: () => void;
  onUpdate: (patch: Partial<ScheduleEvent>) => void;
}) {
  const [noteText, setNoteText] = useState("");
  const [noteFile, setNoteFile] = useState<string | null>(null);
  const noteFileRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [reminder, setReminder] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!event) return null;
  const isPast = new Date(event.end).getTime() < Date.now();

  const addNote = () => {
    const text = noteText.trim();
    if (!text && !noteFile) return;
    onUpdate({
      notes: [
        ...(event.notes ?? []),
        { id: `n${Date.now()}`, text: text || "(file attached)", at: new Date().toISOString(), fileName: noteFile ?? undefined },
      ],
    });
    setNoteText("");
    setNoteFile(null);
  };

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="text-xs text-muted-foreground">
            {new Date(event.start).toLocaleString()} – {new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>

          <div>
            <Label>Meeting Link</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={link || event.meetingLink || ""}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
              <Button
                variant="outline"
                onClick={() => {
                  onUpdate({ meetingLink: link || event.meetingLink });
                  toast.success("Link saved");
                }}
              >
                Save
              </Button>
              {event.meetingLink && (
                <Button asChild>
                  <a href={event.meetingLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" /> Join
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label>Reminder (minutes before)</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                type="number"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                placeholder="e.g., 15"
                className="w-32"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const m = Number(reminder);
                  if (!m) return;
                  onUpdate({ reminderMinutes: m });
                  toast.success(`Reminder set ${m} min before`);
                }}
              >
                <Bell className="mr-1 h-4 w-4" /> Set
              </Button>
              {event.reminderMinutes && (
                <span className="self-center text-xs text-muted-foreground">
                  Currently: {event.reminderMinutes} min
                </span>
              )}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <div className="mt-1.5 space-y-2">
              {(event.notes ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No notes yet.</p>
              )}
              {(event.notes ?? []).map((n) => (
                <div key={n.id} className="rounded-md border bg-muted/40 p-2 text-sm">
                  <p>{n.text}</p>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Add a note…" />
              <Button onClick={addNote} disabled={!noteText.trim()}>Add</Button>
            </div>
          </div>

          <div>
            <Label>Files</Label>
            <div className="mt-1.5 space-y-1">
              {(event.attachments ?? []).map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                  <Paperclip className="h-3 w-3" /> {a}
                  <button
                    className="ml-auto"
                    onClick={() =>
                      onUpdate({ attachments: (event.attachments ?? []).filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onUpdate({ attachments: [...(event.attachments ?? []), f.name] });
              }}
            />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fileRef.current?.click()}>
              <UploadCloud className="mr-1 h-4 w-4" /> Upload File
            </Button>
          </div>

          {isPast && (
            <div className="rounded-md border bg-muted/40 p-3">
              <Label>Did you attend? Rate this session</Label>
              <div className="mt-2">
                <RatingStars value={event.rating ?? 0} onChange={(r) => onUpdate({ rating: r })} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}