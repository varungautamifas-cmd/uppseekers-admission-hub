import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRY_OPTIONS } from "@/lib/portal-store";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
};

export function MultiSelectCountries({ value, onChange, max = 3 }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => COUNTRY_OPTIONS.filter((c) => c.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const toggle = (c: string) => {
    if (value.includes(c)) {
      onChange(value.filter((x) => x !== c));
      setError(null);
    } else {
      if (value.length >= max) {
        setError(`Maximum of ${max} selections allowed.`);
        return;
      }
      onChange([...value, c]);
      setError(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
      >
        <div className="flex flex-wrap gap-1.5">
          {value.length === 0 && <span className="text-muted-foreground">Select up to {max} countries…</span>}
          {value.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {c}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(c);
                }}
              />
            </span>
          ))}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries…"
            className="w-full border-b bg-transparent px-3 py-2 text-sm outline-none"
          />
          <ul className="max-h-56 overflow-auto py-1">
            {filtered.map((c) => {
              const selected = value.includes(c);
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => toggle(c)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-accent",
                      selected && "bg-accent/60",
                    )}
                  >
                    <span>{c}</span>
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
            )}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}