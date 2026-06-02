import { useMemo, useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { StudentTask, TaskCategory, TaskStatus } from "@/lib/portal-types";
import { TASK_CATEGORIES } from "@/lib/portal-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { CalendarDays, Check, Link2, MessageSquarePlus, Paperclip, Pencil, Plus, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function categoryClass(c: string) {
  switch (c) {
    case "Documentation":
      return "bg-blue-100 text-blue-700";
    case "Test Prep":
      return "bg-purple-100 text-purple-700";
    case "Research":
      return "bg-emerald-100 text-emerald-700";
    case "Essay":
      return "bg-pink-100 text-pink-700";
    case "Application":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-muted text-foreground";
  }
}

export function Tasks() {
  const { tasks, setTaskStatus, uploadTaskFile, addTask, updateTask } = usePortal();
  const [dragId, setDragId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Filters
  const [fCategory, setFCategory] = useState<string>("All");
  const [fCreatedBy, setFCreatedBy] = useState<string>("All");
  const [fCreatedFrom, setFCreatedFrom] = useState("");
  const [fDueFrom, setFDueFrom] = useState("");
  const [fDueTo, setFDueTo] = useState("");

  const creators = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.createdBy).filter(Boolean) as string[])),
    [tasks],
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (fCategory !== "All" && t.category !== fCategory) return false;
      if (fCreatedBy !== "All" && t.createdBy !== fCreatedBy) return false;
      if (fCreatedFrom && new Date(t.createdAt) < new Date(fCreatedFrom)) return false;
      if (fDueFrom && new Date(t.dueDate) < new Date(fDueFrom)) return false;
      if (fDueTo && new Date(t.dueDate) > new Date(fDueTo)) return false;
      return true;
    });
  }, [tasks, fCategory, fCreatedBy, fCreatedFrom, fDueFrom, fDueTo]);

  const detail = detailId ? tasks.find((t) => t.id === detailId) ?? null : null;

  return (
    <div className="space-y-4">
      {/* Filter & Action bar */}
      <Card className="flex flex-wrap items-end gap-3 p-3">
        <div>
          <Label className="text-[11px]">Category</Label>
          <Select value={fCategory} onValueChange={setFCategory}>
            <SelectTrigger className="mt-1 h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {TASK_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Created To</Label>
          <Select value={fCreatedBy} onValueChange={setFCreatedBy}>
            <SelectTrigger className="mt-1 h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Users</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Created From</Label>
          <Input
            type="date"
            value={fCreatedFrom}
            onChange={(e) => setFCreatedFrom(e.target.value)}
            className="mt-1 h-8 w-[150px]"
          />
        </div>
        <div>
          <Label className="text-[11px]">Due From</Label>
          <Input
            type="date"
            value={fDueFrom}
            onChange={(e) => setFDueFrom(e.target.value)}
            className="mt-1 h-8 w-[150px]"
          />
        </div>
        <div>
          <Label className="text-[11px]">Due To</Label>
          <Input
            type="date"
            value={fDueTo}
            onChange={(e) => setFDueTo(e.target.value)}
            className="mt-1 h-8 w-[150px]"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFCategory("All");
            setFCreatedBy("All");
            setFCreatedFrom("");
            setFDueFrom("");
            setFDueTo("");
          }}
        >
          Clear
        </Button>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Task
          </Button>
        </div>
      </Card>

    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = filtered.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) setTaskStatus(dragId, col.key);
              setDragId(null);
            }}
            className="flex flex-col rounded-lg bg-muted/40 p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {colTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onDragStart={() => setDragId(t.id)}
                  onOpen={() => setDetailId(t.id)}
                  onSave={(patch) => updateTask(t.id, patch)}
                  onUpload={(name) => {
                    uploadTaskFile(t.id, name);
                    toast.success(`Uploaded "${name}". Task moved to Completed.`);
                  }}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

    <CreateTaskDialog
      open={createOpen}
      onOpenChange={setCreateOpen}
      onCreate={(t) => {
        addTask(t);
        toast.success("Task created");
      }}
    />
    <TaskDetailDialog
      task={detail}
      onClose={() => setDetailId(null)}
      onUpdate={(patch) => detail && updateTask(detail.id, patch)}
    />
    </div>
  );
}

function TaskCard({
  task,
  onDragStart,
  onOpen,
  onSave,
  onUpload,
}: {
  task: StudentTask;
  onDragStart: () => void;
  onOpen: () => void;
  onSave: (patch: Partial<StudentTask>) => void;
  onUpload: (fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description,
    category: task.category,
    dueDate: task.dueDate,
  });
  const overdue =
    task.status !== "completed" && new Date(task.dueDate).getTime() < Date.now();

  if (edit) {
    return (
      <Card className="space-y-2 p-3">
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="h-8" placeholder="Title" />
        <Textarea value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} />
        <div className="grid grid-cols-2 gap-2">
          <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as TaskCategory })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" className="h-8" value={draft.dueDate.slice(0, 10)}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => { onSave(draft); setEdit(false); toast.success("Task updated"); }}>
            <Check className="mr-1 h-3.5 w-3.5" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEdit(false)}>
            <X className="mr-1 h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDoubleClick={onOpen}
      className="group cursor-grab space-y-2 p-3 active:cursor-grabbing"
      title="Double-click for notes & files"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            categoryClass(task.category),
          )}
        >
          {task.category}
        </span>
        {task.syncedFromScheduleId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Link2 className="h-3 w-3" /> Schedule Sync
          </span>
        )}
        {(task.notes?.length ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquarePlus className="h-3 w-3" /> {task.notes!.length}
          </span>
        )}
        {(task.attachments?.length ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Paperclip className="h-3 w-3" /> {task.attachments!.length}
          </span>
        )}
        <button
          className="ml-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); setEdit(true); }}
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="font-medium leading-snug">{task.title}</div>
      <p className="text-xs text-muted-foreground">{task.description}</p>
      <div className="flex items-center gap-1.5 text-xs">
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        <span className={cn(overdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
          Due {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
      {typeof task.progress === "number" && task.status !== "completed" && (
        <Progress value={task.progress} className="h-1.5" />
      )}
      {task.requiresUpload && task.status !== "completed" && (
        <>
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
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <UploadCloud className="mr-1 h-4 w-4" /> Upload File
          </Button>
        </>
      )}
      {task.uploadedFile && (
        <div className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
          ✓ {task.uploadedFile}
        </div>
      )}
    </Card>
  );
}

function CreateTaskDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (t: StudentTask) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Documentation");
  const [dueDate, setDueDate] = useState("");
  const [requiresUpload, setRequiresUpload] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("Documentation");
    setDueDate("");
    setRequiresUpload(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g., Draft Stanford supplemental essay"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiresUpload}
              onChange={(e) => setRequiresUpload(e.target.checked)}
            />
            Requires file upload to complete
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!title || !dueDate}
            onClick={() => {
              onCreate({
                id: `t${Date.now()}`,
                title,
                description,
                category,
                dueDate,
                createdAt: new Date().toISOString().slice(0, 10),
                status: "todo",
                requiresUpload,
              });
              onOpenChange(false);
              reset();
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailDialog({
  task,
  onClose,
  onUpdate,
}: {
  task: StudentTask | null;
  onClose: () => void;
  onUpdate: (patch: Partial<StudentTask>) => void;
}) {
  const [noteText, setNoteText] = useState("");
  const [noteFile, setNoteFile] = useState<string | null>(null);
  const noteFileRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!task) return null;

  const addNote = () => {
    const text = noteText.trim();
    if (!text && !noteFile) return;
    onUpdate({
      notes: [
        ...(task.notes ?? []),
        { id: `n${Date.now()}`, text: text || "(file attached)", at: new Date().toISOString(), fileName: noteFile ?? undefined },
      ],
    });
    setNoteText("");
    setNoteFile(null);
  };

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={cn("rounded-full px-2 py-0.5 font-medium", categoryClass(task.category))}>
              {task.category}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5">
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{task.description}</p>

          <div>
            <Label>Notes</Label>
            <div className="mt-1.5 space-y-2">
              {(task.notes ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No notes yet.</p>
              )}
              {(task.notes ?? []).map((n) => (
                <div key={n.id} className="rounded-md border bg-muted/40 p-2 text-sm">
                  <p>{n.text}</p>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Add a note…"
              />
              <Button onClick={addNote} disabled={!noteText.trim()}>
                Add
              </Button>
            </div>
          </div>

          <div>
            <Label>Attachments</Label>
            <div className="mt-1.5 space-y-1">
              {(task.attachments ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No files attached.</p>
              )}
              {(task.attachments ?? []).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                >
                  <Paperclip className="h-3 w-3" /> {a}
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
                onUpdate({ attachments: [...(task.attachments ?? []), f.name] });
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileRef.current?.click()}
            >
              <UploadCloud className="mr-1 h-4 w-4" /> Upload File
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}