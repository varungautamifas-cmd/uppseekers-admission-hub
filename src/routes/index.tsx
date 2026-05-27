import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalProvider } from "@/lib/portal-store";
import { Sidebar, getNavItems } from "@/components/portal/Sidebar";
import { TopHeader } from "@/components/portal/TopHeader";
import { ProfileOverview } from "@/components/portal/tabs/ProfileOverview";
import { Documents } from "@/components/portal/tabs/Documents";
import { Tasks } from "@/components/portal/tabs/Tasks";
import { Schedule } from "@/components/portal/tabs/Schedule";
import { Universities } from "@/components/portal/tabs/Universities";
import { Messages } from "@/components/portal/tabs/Messages";
import { Toaster } from "@/components/ui/sonner";
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
    <PortalProvider>
      <PortalShell />
      <Toaster richColors position="top-right" />
    </PortalProvider>
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
          </div>
        </main>
      </div>
    </div>
  );
}
