import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalProvider } from "@/lib/portal-store";
import { Sidebar, getNavItems } from "@/components/portal/Sidebar";
import { TopHeader } from "@/components/portal/TopHeader";
import { ProfileOverview } from "@/components/portal/tabs/ProfileOverview";
import { Documents } from "@/components/portal/tabs/Documents";
import { Tasks } from "@/components/portal/tabs/Tasks";
import { Schedule } from "@/components/portal/tabs/Schedule";
import { Universities } from "@/components/portal/tabs/Universities";
import { Messages } from "@/components/portal/tabs/Messages";
import { Settings } from "@/components/portal/tabs/Settings";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { TabKey } from "@/lib/portal-types";
import { loadAccounts, loadCurrentUser, saveCurrentUser, type CurrentUser } from "@/lib/accounts-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uppseekers Admission Hub" },
      { name: "description", content: "Track your university admissions journey — profile, tasks, schedule, universities and counselor chat in one student portal." },
      { property: "og:title", content: "Uppseekers Admission Hub" },
      { property: "og:description", content: "Track your university admissions journey in one student portal." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AuthGate
      render={(user) => (
        <PortalProvider blank={!user.isAdmin} studentName={user.name}>
          <PortalShell />
        </PortalProvider>
      )}
    >
      <Toaster richColors position="top-right" />
    </AuthGate>
  );
}

const ADMIN_EMAIL = "uppseekers@gmail.com";
const ADMIN_PASSWORD = "123456";

function AuthGate({
  render,
  children,
}: {
  render: (user: CurrentUser) => React.ReactNode;
  children?: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setUser(loadCurrentUser());
    setReady(true);
  }, []);

  const logout = () => {
    saveCurrentUser(null);
    setUser(null);
  };

  if (!ready) return null;
  if (!user) {
    return (
      <LoginScreen
        onSuccess={(u) => {
          saveCurrentUser(u);
          setUser(u);
        }}
      />
    );
  }

  return (
    <>
      {render(user)}
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs shadow-sm">
        <span className="text-muted-foreground">
          {user.name} <span className="opacity-60">({user.role})</span>
        </span>
        <button
        onClick={logout}
        className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-medium hover:bg-accent"
        title="Log out"
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>
    </>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: (u: CurrentUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (em === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      toast.success("Welcome back, Admin!");
      onSuccess({ email: ADMIN_EMAIL, name: "Administrator", role: "Admin", isAdmin: true });
      return;
    }
    const account = loadAccounts().find((a) => a.email.toLowerCase() === em);
    if (!account) return setErr("No account found for this email");
    if (account.status === "Suspended") return setErr("Account is suspended");
    if (account.password !== password) return setErr("Invalid email or password");
    toast.success(`Welcome, ${account.name}!`);
    onSuccess({ email: account.email, name: account.name, role: account.role, isAdmin: false });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">Uppseekers Admission Hub</h1>
          <p className="text-xs text-muted-foreground">Sign in to access your portal</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="username" value={email}
              onChange={(e) => { setEmail(e.target.value); setErr(""); }} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password}
              onChange={(e) => { setPassword(e.target.value); setErr(""); }} className="mt-1.5" />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            New accounts are created by an Admin in Settings → Users & Accounts.
          </p>
        </form>
      </Card>
    </div>
  );
}

function PortalShell() {
  const [active, setActive] = useState<TabKey>("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = getNavItems(0).find((n) => n.key === active)?.label ?? "";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        active={active}
        onSelect={setActive}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <div key={active} className="animate-fade-in mx-auto max-w-6xl">
            <h1 className="mb-4 text-xl font-semibold md:text-2xl">{title}</h1>
            {active === "profile" && <ProfileOverview />}
            {active === "documents" && <Documents />}
            {active === "tasks" && <Tasks />}
            {active === "schedule" && <Schedule />}
            {active === "universities" && <Universities />}
            {active === "messages" && <Messages />}
            {active === "settings" && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}
