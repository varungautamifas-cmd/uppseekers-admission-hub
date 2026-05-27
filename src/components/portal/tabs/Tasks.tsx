import { useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { StudentTask, TaskStatus } from "@/lib/portal-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CalendarDays, Link2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function categoryClass(c: StudentTask["category"]) {
  switch (c) {
    case "Documentation":
      return "bg-blue-100 text-blue-700";
    case "Test Prep":
      return "bg-purple-100 text-purple-700";
    case "Research":
      return "bg-emerald-100 text-emerald-700";
  }
}

export function Tasks() {
  const { tasks, setTaskStatus, uploadTaskFile } = usePortal();
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
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
  );
}

function TaskCard({
  task,
  onDragStart,
  onUpload,
}: {
  task: StudentTask;
  onDragStart: () => void;
  onUpload: (fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const overdue =
    task.status !== "completed" && new Date(task.dueDate).getTime() < Date.now();

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className="cursor-grab space-y-2 p-3 active:cursor-grabbing"
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
            onClick={() => inputRef.current?.click()}
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