import { cn } from "@/lib/utils";
import { usePortal } from "@/lib/portal-store";
import type { TabKey } from "@/lib/portal-types";
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  CalendarClock,
  GraduationCap,
  MessageSquare,
  Settings as SettingsIcon,
  X,
} from "lucide-react";

export type NavItem = {
  key: TabKey;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

export function getNavItems(unread: number): NavItem[] {
  return [
    { key: "profile", label: "Profile Overview", icon: LayoutDashboard },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "tasks", label: "Tasks & Deadlines", icon: ListChecks },
    { key: "schedule", label: "Schedule & Batches", icon: CalendarClock },
    { key: "universities", label: "Targeted Universities", icon: GraduationCap },
    { key: "messages", label: "Messages", icon: MessageSquare, badge: unread || undefined },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];
}

type Props = {
  active: TabKey;
  onSelect: (k: TabKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ active, onSelect, mobileOpen, onCloseMobile }: Props) {
  const { student, unreadMessages } = usePortal();
  const items = getNavItems(unreadMessages);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              U
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Uppseekers</div>
              <div className="text-[11px] text-muted-foreground leading-tight">Admission Hub</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1 hover:bg-sidebar-accent md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-3 mb-4 flex items-center gap-3 rounded-lg bg-sidebar-accent/60 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {student.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{student.name}</div>
            <div className="text-xs text-muted-foreground">{student.grade}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key);
                  onCloseMobile();
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-destructive-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 text-[11px] text-muted-foreground">
          © 2026 Uppseekers
        </div>
      </aside>
    </>
  );
}