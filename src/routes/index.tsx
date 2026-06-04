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
    <AuthGate>
      <PortalProvider>
        <PortalShell />
      </PortalProvider>
      <Toaster richColors position="top-right" />
    </AuthGate>
  );
}

const AUTH_KEY = "uppseekers_auth_v1";
const ADMIN_EMAIL = "uppseekers@gmail.com";
const ADMIN_PASSWORD = "123456";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    try {
      setAuthed(typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "1");
    } catch {
      setAuthed(false);
    }
    setReady(true);
  }, []);

  const logout = () => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
  };

  if (!ready) return null;
  if (!authed) {
    return (
      <LoginScreen
        onSuccess={() => {
          try { localStorage.setItem(AUTH_KEY, "1"); } catch {}
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <>
      {children}
      <button
        onClick={logout}
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
        title="Log out"
      >
        <LogOut className="h-3.5 w-3.5" /> Log out
      </button>
    </>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      toast.success("Welcome back!");
      onSuccess();
    } else {
      setErr("Invalid email or password");
    }
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
