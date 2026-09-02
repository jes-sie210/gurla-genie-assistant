import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
  Menu,
  MessageCircleHeart,
  Search,
  Settings,
  Sparkle,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import genieLogo from "@/assets/genie-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const DISCLAIMER =
  "AI Gurla Genie Assistant provides general productivity and research support. Please verify important information and use your own judgement when making workplace decisions.";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chatbot", icon: MessageCircleHeart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-border/70 bg-cream/70 px-4 py-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <span className="font-semibold text-foreground">Responsible AI: </span>
      {DISCLAIMER}
    </p>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-soft"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={genieLogo}
        alt="AI Gurla Genie Assistant logo"
        className="size-10 rounded-xl bg-cream/80 p-1"
      />
      <div className="leading-tight">
        <p className="font-display text-base font-semibold">Gurla Genie</p>
        <p className="text-xs text-muted-foreground">AI workday assistant</p>
      </div>
    </div>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Brand />
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto rounded-xl border border-border/70 bg-gradient-hero p-4">
        <Sparkle className="size-4 text-gold" />
        <p className="mt-2 font-display text-sm font-semibold">You&apos;ve got this, girl!</p>
        <p className="mt-1 text-xs text-muted-foreground">
          One focused block at a time. Your genie handles the planning.
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarInner />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarInner onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold md:text-xl">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p>
            ) : null}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
