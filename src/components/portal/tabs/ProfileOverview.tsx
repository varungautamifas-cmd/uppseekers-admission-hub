import { useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { Activity } from "@/lib/portal-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { MultiSelectCountries } from "@/components/portal/MultiSelectCountries";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES: Activity["category"][] = [
  "Leadership",
  "Community Service",
  "Super-Curricular",
  "Sports",
  "Arts",
];

const BUDGETS = [
  "Need partial scholarship (Budget: $20k-$30k/yr)",
  "Budget is flexible ($40k-$60k/yr)",
  "No financial aid required",
];

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Gap Year"] as const;

export function ProfileOverview() {
  const { profile, setProfile } = usePortal();
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [open, setOpen] = useState(false);

  const update = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const onSave = () => {
    setProfile(draft);
    toast.success("Profile updated. Counselor notified — Spider chart will refresh.");
  };

  const openAdd = () => {
    setEditing({ id: `a${Date.now()}`, category: "Leadership", title: "", timeline: "", description: "" });
    setOpen(true);
  };
  const openEdit = (a: Activity) => {
    setEditing({ ...a });
    setOpen(true);
  };
  const removeActivity = (id: string) =>
    setDraft((d) => ({ ...d, activities: d.activities.filter((a) => a.id !== id) }));

  const saveActivity = () => {
    if (!editing) return;
    setDraft((d) => {
      const exists = d.activities.some((a) => a.id === editing.id);
      return {
        ...d,
        activities: exists
          ? d.activities.map((a) => (a.id === editing.id ? editing : a))
          : [...d.activities, editing],
      };
    });
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Full Name</Label>
            <Input value={draft.fullName} readOnly className="mt-1.5 bg-muted" />
          </div>
          <div>
            <Label>Current School</Label>
            <Input
              value={draft.school}
              onChange={(e) => update("school", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Current Grade / Year</Label>
            <Select value={draft.grade} onValueChange={(v) => update("grade", v as typeof draft.grade)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <NumField label="Grade 9 Score (%)" value={draft.grade9} onChange={(v) => update("grade9", v)} />
          <NumField label="Grade 10 Score (%)" value={draft.grade10} onChange={(v) => update("grade10", v)} />
          <NumField
            label="Expected Grade 11/12 (%)"
            value={draft.expectedGrade}
            onChange={(v) => update("expectedGrade", v)}
          />
          <div>
            <Label>SAT/ACT Score</Label>
            <Input
              value={draft.satAct}
              onChange={(e) => update("satAct", e.target.value)}
              className="mt-1.5"
              placeholder="e.g., SAT 1480"
            />
          </div>
          <div>
            <Label>English Proficiency</Label>
            <Input
              value={draft.english}
              onChange={(e) => update("english", e.target.value)}
              className="mt-1.5"
              placeholder="e.g., TOEFL 110"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aspirations & Targets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Target Geographies (max 3)</Label>
            <div className="mt-1.5">
              <MultiSelectCountries
                value={draft.geographies}
                onChange={(v) => update("geographies", v)}
              />
            </div>
          </div>
          <div>
            <Label>Intended Majors / Fields of Study</Label>
            <Textarea
              value={draft.majors}
              onChange={(e) => update("majors", e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>
          <div>
            <Label>Targeting Indian Entrance Exams?</Label>
            <Textarea
              value={draft.indianExams}
              onChange={(e) => update("indianExams", e.target.value)}
              className="mt-1.5"
              rows={3}
              placeholder="JEE, CUET, BITSAT details…"
            />
          </div>
          <div>
            <Label>Financial Budget / Requirement</Label>
            <Select value={draft.budget} onValueChange={(v) => update("budget", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGETS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Activities Log</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd}>
                <Plus className="mr-1 h-4 w-4" /> Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing && draft.activities.some((a) => a.id === editing.id)
                    ? "Edit Activity"
                    : "Add Activity"}
                </DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="grid gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={editing.category}
                      onValueChange={(v) =>
                        setEditing({ ...editing, category: v as Activity["category"] })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title / Role</Label>
                    <Input
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      placeholder="e.g., President, Coding Club"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <Input
                      value={editing.timeline}
                      onChange={(e) => setEditing({ ...editing, timeline: e.target.value })}
                      placeholder="e.g., Grade 10, 11 | 4 hrs/week"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveActivity} disabled={!editing?.title}>
                  Save Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {draft.activities.length === 0 && (
            <p className="text-sm text-muted-foreground">No activities logged yet.</p>
          )}
          {draft.activities.map((a) => (
            <div
              key={a.id}
              className="group flex items-start gap-3 rounded-md border bg-card p-3 transition-shadow hover:shadow-sm"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {a.category}
                  </span>
                  <span className="font-medium">{a.title}</span>
                  <span className="text-xs text-muted-foreground">{a.timeline}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="icon" variant="ghost" onClick={() => openEdit(a)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeActivity(a.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onSave}>
          Save Updates
        </Button>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
      />
    </div>
  );
}