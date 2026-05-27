import { Menu, Bell } from "lucide-react";

type Props = {
  title: string;
  onOpenMobile: () => void;
};

export function TopHeader({ title, onOpenMobile }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        className="rounded-md p-2 hover:bg-accent md:hidden"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <nav className="text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-muted-foreground">
          <li>Dashboard</li>
          <li aria-hidden>/</li>
          <li key={title} className="animate-fade-in font-medium text-foreground">
            {title}
          </li>
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <button className="relative rounded-full p-2 hover:bg-accent" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}