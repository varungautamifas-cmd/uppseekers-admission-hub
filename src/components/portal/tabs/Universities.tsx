import { useState } from "react";
import { usePortal } from "@/lib/portal-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import type { Difficulty, University } from "@/lib/portal-types";
import {
  ESSAY_STATUSES,
  RESEARCH_PAPER_STATUSES,
  LOR_STATUSES,
  TRANSCRIPT_GRADES,
  type EssayStatus,
  type LorStatus,
  type ResearchPaperStatus,
} from "@/lib/portal-types";
import { CalendarClock, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

function difficultyClass(d: Difficulty) {
  return d === "Reach"
    ? "bg-red-100 text-red-700 border-red-200"
    : d === "Target"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function essayScore(s?: EssayStatus): number {
  const m: Record<EssayStatus, number> = {
    "Not Started Yet": 0, "Working": 33, "1st Draft Ready": 66, "Done": 100,
  };
  return s ? m[s] : 0;
}
function researchScore(s?: ResearchPaperStatus): number {
  const m: Record<ResearchPaperStatus, number> = {
    "Not Writing": 0, "Working": 25, "1st Draft Ready": 50,
    "Prepared and Reviewed": 75, "Published": 100,
  };
  return s ? m[s] : 0;
}
function lorScore(s?: LorStatus): number { return s === "Uploaded" ? 100 : 0; }

export function computeUniversityProgress(u: Partial<University>): number {
  const parts = [
    essayScore(u.essayStatus),
    essayScore(u.suppEssayStatus),
    ((u.internshipsCount ?? 0) / 3) * 100,
    researchScore(u.researchPaperStatus),
    ((u.transcripts?.length ?? 0) / TRANSCRIPT_GRADES.length) * 100,
    lorScore(u.lor1),
    lorScore(u.lor2),
    lorScore(u.lor3),
  ];
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function Universities() {
  const { universities, addUniversity, updateUniversity } = usePortal();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = editId ? universities.find((u) => u.id === editId) ?? null : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add University
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
      {universities.map((u) => (
        <Card
          key={u.id}
          className="cursor-pointer p-5 transition-shadow hover:shadow-md"
          onDoubleClick={() => setEditId(u.id)}
          title="Double-click to update preparation progress"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold leading-tight">{u.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {u.location}
                </span>
                <span>· {u.major}</span>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                difficultyClass(u.difficulty),
              )}
            >
              {u.difficulty}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-muted/40 p-3 text-xs">
            <div>
              <div className="font-semibold uppercase tracking-wide text-muted-foreground">
                Early Action / Decision
              </div>
              <div className="mt-0.5 flex items-center gap-1 font-medium">
                <CalendarClock className="h-3.5 w-3.5" />
                {u.earlyDeadline}
              </div>
            </div>
            <div>
              <div className="font-semibold uppercase tracking-wide text-muted-foreground">
                Regular Decision
              </div>
              <div className="mt-0.5 flex items-center gap-1 font-medium">
                <CalendarClock className="h-3.5 w-3.5" />
                {u.regularDeadline}
              </div>
            </div>
          </div>

          <Block title="Core Vision">{u.coreVision}</Block>
          <Block title="Extracurricular Biases">{u.ecBiases}</Block>
          <Block title="Differentiators">{u.differentiators}</Block>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Preparation Progress</span>
              <span>{u.progress ?? 0}%</span>
            </div>
            <Progress value={u.progress ?? 0} className="h-1.5" />
            {u.progressNotes && (
              <p className="mt-2 text-xs text-muted-foreground">{u.progressNotes}</p>
            )}
          </div>
        </Card>
      ))}
      </div>

      <UniversityFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(u) => {
          addUniversity(u);
          toast.success(`${u.name} added`);
        }}
      />
      <ProgressDialog
        university={editing}
        onClose={() => setEditId(null)}
        onUpdate={(patch) => editing && updateUniversity(editing.id, patch)}
      />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <p className="mt-0.5 text-sm">{children}</p>
    </div>
  );
}

function UniversityFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (u: University) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [major, setMajor] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Target");
  const [earlyDeadline, setEarlyDeadline] = useState("");
  const [regularDeadline, setRegularDeadline] = useState("");
  const [coreVision, setCoreVision] = useState("");
  const [ecBiases, setEcBiases] = useState("");
  const [differentiators, setDifferentiators] = useState("");

  const reset = () => {
    setName(""); setLocation(""); setMajor(""); setDifficulty("Target");
    setEarlyDeadline(""); setRegularDeadline(""); setCoreVision("");
    setEcBiases(""); setDifferentiators("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add University</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2"><Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
          <div><Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" placeholder="City, Country" /></div>
          <div><Label>Major / Program</Label>
            <Input value={major} onChange={(e) => setMajor(e.target.value)} className="mt-1.5" /></div>
          <div><Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Reach">Reach</SelectItem>
                <SelectItem value="Target">Target</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Early Deadline</Label>
            <Input value={earlyDeadline} onChange={(e) => setEarlyDeadline(e.target.value)} className="mt-1.5" placeholder="e.g., Nov 1, 2026" /></div>
          <div><Label>Regular Deadline</Label>
            <Input value={regularDeadline} onChange={(e) => setRegularDeadline(e.target.value)} className="mt-1.5" placeholder="e.g., Jan 3, 2027" /></div>
          <div className="md:col-span-2"><Label>Core Vision</Label>
            <Textarea value={coreVision} onChange={(e) => setCoreVision(e.target.value)} rows={2} className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>EC Biases</Label>
            <Textarea value={ecBiases} onChange={(e) => setEcBiases(e.target.value)} rows={2} className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>Your Differentiators</Label>
            <Textarea value={differentiators} onChange={(e) => setDifferentiators(e.target.value)} rows={2} className="mt-1.5" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name || !location || !major}
            onClick={() => {
              onSubmit({
                id: `u${Date.now()}`,
                name, location, major, difficulty,
                earlyDeadline: earlyDeadline || "—",
                regularDeadline: regularDeadline || "—",
                coreVision, ecBiases, differentiators,
                progress: 0,
              });
              onOpenChange(false);
              reset();
            }}
          >Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProgressDialog({
  university,
  onClose,
  onUpdate,
}: {
  university: University | null;
  onClose: () => void;
  onUpdate: (patch: Partial<University>) => void;
}) {
  const [form, setForm] = useState<Partial<University>>({});

  if (!university) return null;

  const current: Partial<University> = { ...university, ...form };
  const computed = computeUniversityProgress(current);
  const set = (patch: Partial<University>) => setForm((f) => ({ ...f, ...patch }));
  const toggleTranscript = (g: string) => {
    const list = current.transcripts ?? [];
    set({ transcripts: list.includes(g) ? list.filter((x) => x !== g) : [...list, g] });
  };

  return (
    <Dialog
      open={!!university}
      onOpenChange={(o) => {
        if (!o) onClose();
        else setForm({});
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{university.name} — Preparation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Essay</Label>
            <Select value={current.essayStatus ?? "Not Started Yet"}
              onValueChange={(v) => set({ essayStatus: v as EssayStatus })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ESSAY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Supplementary Essay</Label>
            <Select value={current.suppEssayStatus ?? "Not Started Yet"}
              onValueChange={(v) => set({ suppEssayStatus: v as EssayStatus })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ESSAY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Internships</Label>
            <Select value={String(current.internshipsCount ?? 0)}
              onValueChange={(v) => set({ internshipsCount: Number(v) as 0 | 1 | 2 | 3 })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Research Paper</Label>
            <Select value={current.researchPaperStatus ?? "Not Writing"}
              onValueChange={(v) => set({ researchPaperStatus: v as ResearchPaperStatus })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESEARCH_PAPER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Transcripts Uploaded</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {TRANSCRIPT_GRADES.map((g) => {
                const checked = (current.transcripts ?? []).includes(g);
                return (
                  <label key={g} className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium",
                    checked ? "border-primary bg-primary/10" : "bg-background hover:bg-accent",
                  )}>
                    <input type="checkbox" checked={checked} onChange={() => toggleTranscript(g)} />
                    {g}
                  </label>
                );
              })}
            </div>
          </div>
          {(["lor1", "lor2", "lor3"] as const).map((k, i) => (
            <div key={k}>
              <Label>LOR {i + 1}</Label>
              <Select value={current[k] ?? "Not Uploaded"}
                onValueChange={(v) => set({ [k]: v as LorStatus } as Partial<University>)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOR_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea value={current.progressNotes ?? ""}
              onChange={(e) => set({ progressNotes: e.target.value })}
              rows={4} className="mt-1.5"
              placeholder="Essay status, recommender outreach, test scores ready, supplements done…" />
          </div>
          <div className="md:col-span-2">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Auto-Calculated Progress</span>
              <span>{computed}%</span>
            </div>
            <Progress value={computed} className="h-2" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            onUpdate({ ...form, progress: computed });
            toast.success(`Progress updated — ${computed}%`);
            onClose();
          }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}