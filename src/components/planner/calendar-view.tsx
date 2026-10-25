"use client";

import { addDays, weekdayOf } from "@/lib/generator/dates";
import { PLAN_DAYS } from "@/lib/generator/schedule";
import { PILLAR_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import type { Slot } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { pillarColor } from "./pillar-badge";
import { PlatformIcon } from "./platform-icon";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Month-style grid of the 30 planned days, weeks starting Monday. */
export function CalendarView({ posts, startDate }: { posts: Slot[]; startDate: string }) {
  const lead = WEEK.indexOf(weekdayOf(startDate));
  const byDate = new Map<string, Slot[]>();
  for (const post of posts) byDate.set(post.date, [...(byDate.get(post.date) ?? []), post]);

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: PLAN_DAYS }, (_, i) => addDays(startDate, i)),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <div className="scrollbar-thin overflow-x-auto p-4 sm:p-5">
      <div className="grid min-w-[860px] grid-cols-7 gap-2">
        {WEEK.map((d) => (
          <div key={d} className="px-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} className="rounded-xl border border-dashed border-line/70" />;
          const day = byDate.get(date) ?? [];
          const dayNum = Number(date.slice(8));
          const weekend = i % 7 >= 5;
          return (
            <div
              key={date}
              className={cn(
                "flex min-h-32 flex-col gap-1.5 rounded-xl border p-2 transition-colors",
                day.length ? "border-line bg-surface shadow-sm" : "border-line/70",
                weekend && !day.length && "bg-surface-2/50",
              )}
            >
              <div className="flex items-baseline justify-between px-0.5">
                <span className={cn("font-mono text-[12px]", day.length ? "font-semibold text-ink" : "text-ink-3")}>
                  {dayNum === 1 || i === lead ? `${date.slice(5, 7)}/${String(dayNum).padStart(2, "0")}` : dayNum}
                </span>
                {day.length > 1 && <span className="text-[10px] font-medium text-ink-3">{day.length} posts</span>}
              </div>
              {day.map((post) => (
                <div
                  key={post.position}
                  title={`${PLATFORM_LABELS[post.platform]} · ${PILLAR_LABELS[post.pillar]} · ${post.format}`}
                  className="rounded-lg border-l-[3px] px-2 py-1.5"
                  style={{ borderColor: pillarColor(post.pillar), background: pillarColor(post.pillar, true) }}
                >
                  <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-2">
                    <PlatformIcon platform={post.platform} className="size-3" />
                    <span className="font-mono">{post.postTime}</span>
                    <span className="truncate font-normal text-ink-3">{post.format}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug font-medium text-ink">{post.topic}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
