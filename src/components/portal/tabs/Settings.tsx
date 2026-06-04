import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { usePortal } from "@/lib/portal-store";

type Role = "Admin" | "Manager" | "Counsellor" | "Mentor" | "Student";
const ROLES: Role[] = ["Admin", "Manager", "Counsellor", "Mentor", "Student"];

type Permission = "view" | "create" | "edit" | "delete";
const PERMISSIONS: Permission[] = ["view", "create", "edit", "delete"];

const FEATURES = [
  "Profile Overview",
  "Documents",
  "Tasks & Deadlines",
  "Schedule & Batches",
  "Targeted Universities",
  "Messages",
  "Activities",
  "Assignments",
  "Batch Management",
  "User Accounts",
  "Reports",
  "Settings",
] as const;
type Feature = (typeof FEATURES)[number];

type AccessMatrix = Record<Role, Record<Feature, Record<Permission, boolean>>>;

function defaultMatrix(): AccessMatrix {
  const make = (cfg: (f: Feature) => Partial<Record<Permission, boolean>>) =>
    Object.fromEntries(
      FEATURES.map((f) => [f, { view: false, create: false, edit: false, delete: false, ...cfg(f) }]),
    ) as Record<Feature, Record<Permission, boolean>>;
  return {
    Admin: make(() => ({ view: true, create: true, edit: true, delete: true })),
    Manager: make((f) => ({ view: true, create: f !== "Settings", edit: f !== "Settings", delete: false })),
    Counsellor: make((f) => ({
      view: true,
      create: ["Tasks & Deadlines", "Schedule & Batches", "Messages", "Documents"].includes(f),
      edit: ["Tasks & Deadlines", "Schedule & Batches", "Documents", "Targeted Universities"].includes(f),
      delete: false,
    })),
    Mentor: make((f) => ({
      view: ["Profile Overview", "Tasks & Deadlines", "Schedule & Batches", "Messages", "Documents"].includes(f),
      create: ["Tasks & Deadlines", "Messages"].includes(f),
      edit: ["Tasks & Deadlines"].includes(f),
      delete: false,
    })),
    Student: make((f) => ({
      view: f !== "User Accounts" && f !== "Reports",
      create: ["Documents", "Activities", "Tasks & Deadlines"].includes(f),
      edit: ["Profile Overview", "Documents", "Activities", "Tasks & Deadlines", "Targeted Universities"].includes(f),
      delete: false,
    })),
  };
}

type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Invited" | "Suspended";
  createdAt: string;
};

type TabConfig = {
  key: string;
  label: string;
  enabled: boolean;
  visibleTo: Role[];
  fields: { id: string; label: string; type: "text" | "number" | "select" | "textarea" | "date"; required: boolean }[];
};

function defaultTabs(): TabConfig[] {
  return [
    {
      key: "profile", label: "Profile Overview", enabled: true, visibleTo: ROLES,
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true },
        { id: "school", label: "School", type: "text", required: true },
        { id: "grade", label: "Grade", type: "select", required: true },
        { id: "satAct", label: "SAT / ACT", type: "text", required: false },
      ],
    },
    {
      key: "documents", label: "Documents", enabled: true, visibleTo: ROLES,
      fields: [
        { id: "name", label: "File Name", type: "text", required: true },
        { id: "type", label: "Type", type: "select", required: true },
        { id: "status", label: "Status", type: "select", required: true },
      ],
    },
    {
      key: "tasks", label: "Tasks & Deadlines", enabled: true, visibleTo: ROLES,
      fields: [
        { id: "title", label: "Title", type: "text", required: true },
        { id: "category", label: "Category", type: "select", required: true },
        { id: "dueDate", label: "Due Date", type: "date", required: true },
      ],
    },
    {
      key: "schedule", label: "Schedule & Batches", enabled: true, visibleTo: ROLES,
      fields: [
        { id: "title", label: "Session Title", type: "text", required: true },
        { id: "type", label: "Type", type: "select", required: true },
        { id: "start", label: "Start", type: "date", required: true },
      ],
    },
    {
      key: "universities", label: "Targeted Universities", enabled: true, visibleTo: ROLES,
      fields: [
        { id: "name", label: "University", type: "text", required: true },
        { id: "difficulty", label: "Difficulty", type: "select", required: true },
        { id: "regularDeadline", label: "Regular Deadline", type: "date", required: false },
      ],
    },
    {
      key: "messages", label: "Messages", enabled: true, visibleTo: ROLES,
      fields: [],
    },
  ];
}

type Assignment = {
  id: string;
  studentEmail: string;
  counsellorEmail: string;
  mentorEmails: string[];
  managerEmail: string;
};

type SystemSettings = {
  brandName: string;
  supportEmail: string;
  timezone: string;
  academicYear: string;
  defaultMeetingDuration: number;
  enableNotifications: boolean;
  enableTwoFactor: boolean;
  enableAutoSync: boolean;
  maintenanceMode: boolean;
};

export function Settings() {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
        <TabsTrigger value="users">Users & Accounts</TabsTrigger>
        <TabsTrigger value="access">Roles & Access</TabsTrigger>
        <TabsTrigger value="tabs">Tabs & Fields</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="batches">Batches</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>
      <TabsContent value="users"><UsersPanel /></TabsContent>
      <TabsContent value="access"><AccessPanel /></TabsContent>
      <TabsContent value="tabs"><TabsFieldsPanel /></TabsContent>
      <TabsContent value="assignments"><AssignmentsPanel /></TabsContent>
      <TabsContent value="batches"><BatchesPanel /></TabsContent>
      <TabsContent value="system"><SystemPanel /></TabsContent>
    </Tabs>
  );
}

/* ---------- Users ---------- */
function UsersPanel() {
  const [users, setUsers] = useState<UserAccount[]>([
    { id: "u1", name: "Aarav Sharma", email: "aarav@student.com", role: "Student", status: "Active", createdAt: "2026-04-01" },
    { id: "u2", name: "Priya Menon", email: "priya.menon@uppseekers.com", role: "Counsellor", status: "Active", createdAt: "2026-01-12" },
    { id: "u3", name: "Rohan Iyer", email: "rohan@uppseekers.com", role: "Mentor", status: "Active", createdAt: "2026-02-22" },
    { id: "u4", name: "Neha Kapoor", email: "neha@uppseekers.com", role: "Manager", status: "Invited", createdAt: "2026-05-01" },
  ]);
  const [form, setForm] = useState<Omit<UserAccount, "id" | "createdAt">>({
    name: "", email: "", role: "Student", status: "Invited",
  });
  const [filter, setFilter] = useState<Role | "All">("All");

  const add = () => {
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name & email required");
    setUsers((xs) => [
      { ...form, id: `u${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) },
      ...xs,
    ]);
    setForm({ name: "", email: "", role: "Student", status: "Invited" });
    toast.success("Account created");
  };

  const update = (id: string, patch: Partial<UserAccount>) =>
    setUsers((xs) => xs.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const filtered = filter === "All" ? users : users.filter((u) => u.role === filter);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Create Account</div>
        <div className="grid gap-3 md:grid-cols-5">
          <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as UserAccount["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Invited">Invited</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end"><Button onClick={add} className="w-full"><Plus className="mr-1 h-4 w-4" />Add</Button></div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">All Accounts ({filtered.length})</div>
          <Select value={filter} onValueChange={(v) => setFilter(v as Role | "All")}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="truncate text-xs text-muted-foreground">{u.email}</div>
              </div>
              <Select value={u.role} onValueChange={(v) => update(u.id, { role: v as Role })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={u.status} onValueChange={(v) => update(u.id, { status: v as UserAccount["status"] })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Invited">Invited</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-[10px]">{u.createdAt}</Badge>
              <Button size="sm" variant="ghost" onClick={() => setUsers((xs) => xs.filter((x) => x.id !== u.id))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Roles & Access ---------- */
function AccessPanel() {
  const [matrix, setMatrix] = useState<AccessMatrix>(defaultMatrix());
  const [role, setRole] = useState<Role>("Counsellor");

  const toggle = (f: Feature, p: Permission) =>
    setMatrix((m) => ({ ...m, [role]: { ...m[role], [f]: { ...m[role][f], [p]: !m[role][f][p] } } }));

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Access Management</div>
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3">Feature</th>
              {PERMISSIONS.map((p) => <th key={p} className="px-2 py-2 text-center capitalize">{p}</th>)}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f} className="border-b">
                <td className="py-2 pr-3">{f}</td>
                {PERMISSIONS.map((p) => (
                  <td key={p} className="px-2 py-2 text-center">
                    <Checkbox checked={matrix[role][f][p]} onCheckedChange={() => toggle(f, p)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={() => toast.success(`Permissions saved for ${role}`)}><Save className="mr-1 h-4 w-4" />Save Permissions</Button>
      </div>
    </Card>
  );
}

/* ---------- Tabs & Fields ---------- */
function TabsFieldsPanel() {
  const [tabs, setTabs] = useState<TabConfig[]>(defaultTabs());
  const [editing, setEditing] = useState<string | null>(null);
  const [newTab, setNewTab] = useState("");

  const updateTab = (key: string, patch: Partial<TabConfig>) =>
    setTabs((xs) => xs.map((t) => (t.key === key ? { ...t, ...patch } : t)));

  const addField = (key: string) =>
    updateTab(key, {
      fields: [...(tabs.find((t) => t.key === key)?.fields ?? []), {
        id: `f${Date.now()}`, label: "New Field", type: "text", required: false,
      }],
    });

  const removeField = (tabKey: string, fid: string) => {
    const t = tabs.find((x) => x.key === tabKey);
    if (t) updateTab(tabKey, { fields: t.fields.filter((f) => f.id !== fid) });
  };

  const addTab = () => {
    if (!newTab.trim()) return;
    setTabs((xs) => [...xs, {
      key: `custom-${Date.now()}`, label: newTab, enabled: true, visibleTo: ROLES, fields: [],
    }]);
    setNewTab("");
    toast.success("Tab added");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Create New Tab</div>
        <div className="flex gap-2">
          <Input placeholder="Tab name (e.g. Scholarships)" value={newTab} onChange={(e) => setNewTab(e.target.value)} />
          <Button onClick={addTab}><Plus className="mr-1 h-4 w-4" />Add Tab</Button>
        </div>
      </Card>

      {tabs.map((t) => (
        <Card key={t.key} className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Input className="max-w-xs" value={t.label} onChange={(e) => updateTab(t.key, { label: e.target.value })} />
            <div className="flex items-center gap-2">
              <Switch checked={t.enabled} onCheckedChange={(v) => updateTab(t.key, { enabled: v })} />
              <span className="text-xs text-muted-foreground">{t.enabled ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="ml-auto flex flex-wrap gap-1">
              {ROLES.map((r) => {
                const on = t.visibleTo.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => updateTab(t.key, { visibleTo: on ? t.visibleTo.filter((x) => x !== r) : [...t.visibleTo, r] })}
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${on ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(editing === t.key ? null : t.key)}>
              {editing === t.key ? <><X className="mr-1 h-4 w-4" />Close</> : <><Pencil className="mr-1 h-4 w-4" />Fields ({t.fields.length})</>}
            </Button>
          </div>

          {editing === t.key && (
            <div className="space-y-2 rounded-md border bg-muted/30 p-3">
              {t.fields.map((f) => (
                <div key={f.id} className="flex flex-wrap items-center gap-2">
                  <Input className="max-w-[200px]" value={f.label} onChange={(e) => updateTab(t.key, {
                    fields: t.fields.map((x) => x.id === f.id ? { ...x, label: e.target.value } : x),
                  })} />
                  <Select value={f.type} onValueChange={(v) => updateTab(t.key, {
                    fields: t.fields.map((x) => x.id === f.id ? { ...x, type: v as TabConfig["fields"][0]["type"] } : x),
                  })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-1.5 text-xs">
                    <Checkbox checked={f.required} onCheckedChange={(v) => updateTab(t.key, {
                      fields: t.fields.map((x) => x.id === f.id ? { ...x, required: !!v } : x),
                    })} /> Required
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => removeField(t.key, f.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => addField(t.key)}><Plus className="mr-1 h-4 w-4" />Add Field</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ---------- Assignments ---------- */
function AssignmentsPanel() {
  const [items, setItems] = useState<Assignment[]>([
    {
      id: "as1", studentEmail: "aarav@student.com",
      counsellorEmail: "priya.menon@uppseekers.com",
      mentorEmails: ["rohan@uppseekers.com"], managerEmail: "neha@uppseekers.com",
    },
  ]);
  const [form, setForm] = useState<Omit<Assignment, "id" | "mentorEmails"> & { mentorsCsv: string }>({
    studentEmail: "", counsellorEmail: "", mentorsCsv: "", managerEmail: "",
  });

  const add = () => {
    if (!form.studentEmail) return toast.error("Student email required");
    setItems((xs) => [...xs, {
      id: `as${Date.now()}`,
      studentEmail: form.studentEmail,
      counsellorEmail: form.counsellorEmail,
      managerEmail: form.managerEmail,
      mentorEmails: form.mentorsCsv.split(",").map((s) => s.trim()).filter(Boolean),
    }]);
    setForm({ studentEmail: "", counsellorEmail: "", mentorsCsv: "", managerEmail: "" });
    toast.success("Assignment created");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Create Assignment</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label className="text-xs">Student Email</Label><Input value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} /></div>
          <div><Label className="text-xs">Counsellor Email</Label><Input value={form.counsellorEmail} onChange={(e) => setForm({ ...form, counsellorEmail: e.target.value })} /></div>
          <div className="md:col-span-1"><Label className="text-xs">Mentors (comma-separated)</Label><Input value={form.mentorsCsv} onChange={(e) => setForm({ ...form, mentorsCsv: e.target.value })} /></div>
          <div><Label className="text-xs">Manager Email</Label><Input value={form.managerEmail} onChange={(e) => setForm({ ...form, managerEmail: e.target.value })} /></div>
        </div>
        <div className="mt-3 flex justify-end"><Button onClick={add}><Plus className="mr-1 h-4 w-4" />Assign</Button></div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Active Assignments ({items.length})</div>
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">{a.studentEmail}</div>
                <Button size="sm" variant="ghost" onClick={() => setItems((xs) => xs.filter((x) => x.id !== a.id))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="mt-1 grid gap-1 text-xs text-muted-foreground md:grid-cols-3">
                <div>Counsellor: <span className="text-foreground">{a.counsellorEmail || "—"}</span></div>
                <div>Manager: <span className="text-foreground">{a.managerEmail || "—"}</span></div>
                <div>Mentors: <span className="text-foreground">{a.mentorEmails.join(", ") || "—"}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Batches ---------- */
function BatchesPanel() {
  const { batches, updateBatch } = usePortal();
  return (
    <Card className="p-4">
      <div className="mb-3 text-sm font-semibold">Batches Quick Edit ({batches.length})</div>
      {batches.length === 0 && (
        <p className="text-sm text-muted-foreground">No batches yet. Create one from Schedule & Batches.</p>
      )}
      <div className="space-y-3">
        {batches.map((b) => (
          <div key={b.id} className="rounded-md border p-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div><Label className="text-xs">Name</Label><Input value={b.name} onChange={(e) => updateBatch(b.id, { name: e.target.value })} /></div>
              <div><Label className="text-xs">Start Time</Label><Input value={b.startTime} onChange={(e) => updateBatch(b.id, { startTime: e.target.value })} /></div>
              <div><Label className="text-xs">End Time</Label><Input value={b.endTime} onChange={(e) => updateBatch(b.id, { endTime: e.target.value })} /></div>
              <div><Label className="text-xs">Meeting Link</Label><Input value={b.meetingLink ?? ""} onChange={(e) => updateBatch(b.id, { meetingLink: e.target.value })} /></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- System ---------- */
function SystemPanel() {
  const [s, setS] = useState<SystemSettings>({
    brandName: "Uppseekers Admission Hub",
    supportEmail: "support@uppseekers.com",
    timezone: "Asia/Kolkata",
    academicYear: "2026-2027",
    defaultMeetingDuration: 60,
    enableNotifications: true,
    enableTwoFactor: false,
    enableAutoSync: true,
    maintenanceMode: false,
  });
  const [announcement, setAnnouncement] = useState("");

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">General</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label className="text-xs">Brand Name</Label><Input value={s.brandName} onChange={(e) => setS({ ...s, brandName: e.target.value })} /></div>
          <div><Label className="text-xs">Support Email</Label><Input value={s.supportEmail} onChange={(e) => setS({ ...s, supportEmail: e.target.value })} /></div>
          <div><Label className="text-xs">Timezone</Label><Input value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value })} /></div>
          <div><Label className="text-xs">Academic Year</Label><Input value={s.academicYear} onChange={(e) => setS({ ...s, academicYear: e.target.value })} /></div>
          <div><Label className="text-xs">Default Meeting Duration (min)</Label>
            <Input type="number" value={s.defaultMeetingDuration} onChange={(e) => setS({ ...s, defaultMeetingDuration: Number(e.target.value) })} /></div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Toggles</div>
        <div className="space-y-3">
          {([
            ["enableNotifications", "Enable email & in-app notifications"],
            ["enableTwoFactor", "Require Two-Factor Auth for Admins"],
            ["enableAutoSync", "Auto-sync Schedule → Tasks"],
            ["maintenanceMode", "Maintenance Mode (block student access)"],
          ] as const).map(([k, label]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch checked={s[k]} onCheckedChange={(v) => setS({ ...s, [k]: v })} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Broadcast Announcement</div>
        <Textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Type a message to all users..." />
        <div className="mt-2 flex justify-end">
          <Button onClick={() => { toast.success("Announcement sent"); setAnnouncement(""); }} disabled={!announcement.trim()}>Send</Button>
        </div>
      </Card>

      <Separator />
      <div className="flex justify-end">
        <Button onClick={() => toast.success("System settings saved")}><Save className="mr-1 h-4 w-4" />Save All Settings</Button>
      </div>
    </div>
  );
}