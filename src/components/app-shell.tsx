"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu, Moon, Plus, Sun } from "lucide-react";
import { Dialog, SheetContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#7c63ff] via-[#5b3df5] to-[#ff6b4a] shadow-[0_8px_24px_-8px_#5b3df5]">
        <svg viewBox="0 0 24 24" className="size-5 text-white" aria-hidden>
          <rect x="4" y="5" width="16" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.8" fill="currentColor" />
        </svg>
      </span>
      <div className="leading-none">
        <span className={cn("font-display text-[22px]", tone === "light" ? "text-white" : "text-ink")}>Cadence</span>
        <span
          className={cn(
            "mt-1 block text-[10px] font-medium tracking-[0.16em] uppercase",
            tone === "light" ? "text-white/40" : "text-ink-3",
          )}
        >
          Content planner
        </span>
      </div>
    </div>
  );
}

function SidebarBody({ children, onNewPlan }: { children: ReactNode; onNewPlan?: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#121017] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-[#5b3df5]/30 blur-3xl"
      />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-72 rounded-full bg-[#ff6b4a]/10 blur-3xl" />
      <div className="relative px-5 pt-6 pb-5">
        <Logo />
      </div>
      <div className="relative px-4">
        <button
          type="button"
          onClick={onNewPlan}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] py-2.5 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
        >
          <Plus className="size-4" /> New plan
        </button>
      </div>
      <div className="scrollbar-thin relative mt-6 flex-1 overflow-y-auto px-3 pb-4">{children}</div>
      <div className="relative border-t border-white/5 p-3">
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AppShell({
  sidebar,
  children,
  onNewPlan,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  onNewPlan?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] lg:block">
        <SidebarBody onNewPlan={onNewPlan}>{sidebar}</SidebarBody>
      </aside>

      <Dialog open={open} onOpenChange={setOpen}>
        <SheetContent title="Saved plans">
          {/* Close the sheet after any click on a plan or button inside it. */}
          <div className="h-full" onClickCapture={(e) => (e.target as HTMLElement).closest("[data-close-sheet]") && setOpen(false)}>
            <SidebarBody
              onNewPlan={() => {
                setOpen(false);
                onNewPlan?.();
              }}
            >
              {sidebar}
            </SidebarBody>
          </div>
        </SheetContent>
      </Dialog>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <Logo tone="dark" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-10 cursor-pointer place-items-center rounded-xl border border-line-strong bg-surface text-ink shadow-sm"
            aria-label="Open saved plans"
          >
            <Menu className="size-5" />
          </button>
        </header>
        <main className="bg-grain min-h-screen">{children}</main>
      </div>
    </div>
  );
}
