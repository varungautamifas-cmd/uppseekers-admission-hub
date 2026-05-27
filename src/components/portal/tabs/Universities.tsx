import { usePortal } from "@/lib/portal-store";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/portal-types";
import { CalendarClock, MapPin } from "lucide-react";

function difficultyClass(d: Difficulty) {
  return d === "Reach"
    ? "bg-red-100 text-red-700 border-red-200"
    : d === "Target"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export function Universities() {
  const { universities } = usePortal();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {universities.map((u) => (
        <Card key={u.id} className="p-5">
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
        </Card>
      ))}
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