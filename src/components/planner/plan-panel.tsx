"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, Rows3 } from "lucide-react";
import { addDays } from "@/lib/generator/dates";
import { PLAN_DAYS } from "@/lib/generator/schedule";
import { longDate } from "@/lib/format";
import { GOAL_LABELS, PILLAR_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import { PILLARS, type Slot } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { CalendarView } from "./calendar-view";
import { pillarColor } from "./pillar-badge";
import { PlanTable, PlanTableSkeleton } from "./plan-table";
import { PLATFORM_COLORS, PlatformIcon } from "./platform-icon";
import { usePlanner } from "./planner-provider";

type View = "table" | "calendar";

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const options = [
    { id: "table" as const, label: "Table", icon: Rows3 },
    { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
  ];
  return (
    <div role="tablist" aria-label="View" className="inline-flex rounded-xl border border-line-strong bg-canvas p-1">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={view === id}
          onClick={() => onChange(id)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
            view === id ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

function Summary({ posts }: { posts: Slot[] }) {
  const total = posts.length;
  const pillarCounts = PILLARS.map((p) => ({ pillar: p, count: posts.filter((s) => s.pillar === p).length }));
  const platformCounts = new Map<Slot["platform"], number>();
  for (const post of posts) platformCounts.set(post.platform, (platformCounts.get(post.platform) ?? 0) + 1);
  const days = new Set(posts.map((p) => p.date)).size;

  return (
    <div className="grid gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-[auto_auto_1fr]">
      <Stat label="Posts" value={total} />
      <Stat label="Active days" value={`${days}/${PLAN_DAYS}`} />
      <div className="bg-surface px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">Pillar mix</span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {[...platformCounts].map(([platform, count]) => (
              <span
                key={platform}
                className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-2"
                title={PLATFORM_LABELS[platform]}
              >
                <span style={{ color: PLATFORM_COLORS[platform] }}>
                  <PlatformIcon platform={platform} className="size-3" />
                </span>
                {count}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2.5 flex h-2 gap-0.5 overflow-hidden rounded-full">
          {pillarCounts
            .filter((p) => p.count)
            .map(({ pillar, count }) => (
              <span
                key={pillar}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                style={{ width: `${(count / total) * 100}%`, background: pillarColor(pillar) }}
              />
            ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {pillarCounts.map(({ pillar, count }) => (
            <span key={pillar} className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
              <span className="size-2 rounded-full" style={{ background: pillarColor(pillar) }} />
              {PILLAR_LABELS[pillar]}
              <span className="font-mono text-ink-3 tabular-nums">{Math.round((count / total) * 100)}%</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-surface px-6 py-4">
      <div className="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">{label}</div>
      <div className="mt-1 font-display text-[34px] leading-none text-ink tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center">
      <div className="mx-auto grid w-fit grid-cols-7 gap-1.5 opacity-80" aria-hidden>
        {Array.from({ length: 21 }, (_, i) => (
          <span
            key={i}
            className="size-5 rounded-md border border-line"
            style={
              [2, 5, 8, 10, 13, 16, 19].includes(i)
                ? { background: pillarColor(PILLARS[i % PILLARS.length], true), borderColor: "transparent" }
                : undefined
            }
          />
        ))}
      </div>
      <h3 className="mt-6 font-display text-[28px] text-ink">Your calendar will land here</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-3">
        Fill in the brief and hit Generate. You can edit any topic or video idea right in the table.
      </p>
    </div>
  );
}

export function PlanPanel({ toolbar }: { toolbar?: ReactNode }) {
  const { state, dispatch } = usePlanner();
  const [view, setView] = useState<View>("table");
  const { input, posts, status } = state;

  if (status === "idle") return <EmptyState />;

  const generating = status === "generating";
  const start = input?.startDate ?? posts[0]?.date;

  return (
    <section
      id="plan"
      aria-label="Posting plan"
      className="scroll-mt-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-md"
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">30-day plan</p>
          <h2 className="mt-1 truncate font-display text-[34px] leading-tight text-ink">
            {generating ? "Building your calendar…" : (input?.brand ?? "Plan")}
          </h2>
          {input && start && (
            <p className="mt-1 text-[13px] text-ink-3">
              {longDate(start)} – {longDate(addDays(start, PLAN_DAYS - 1))} · {GOAL_LABELS[input.goal]} ·{" "}
              {input.postsPerWeek}/week
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!generating && toolbar}
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {generating ? (
        <>
          <div className="h-[104px] border-y border-line bg-surface-2 p-5">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton mt-4 h-2 w-full rounded-full" />
          </div>
          <PlanTableSkeleton />
        </>
      ) : (
        <>
          <Summary posts={posts} />
          <div key={view} className="animate-fade-up">
            {view === "table" ? (
              <PlanTable
                posts={posts}
                onEdit={(position, field, value) => dispatch({ type: "post/edit", position, field, value })}
              />
            ) : (
              start && <CalendarView posts={posts} startDate={start} />
            )}
          </div>
        </>
      )}
    </section>
  );
}
