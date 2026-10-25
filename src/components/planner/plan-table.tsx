"use client";

import { Fragment } from "react";
import { PLATFORM_LABELS } from "@/lib/labels";
import { shortDate } from "@/lib/format";
import type { Slot } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { EditableCell } from "./editable-cell";
import { PillarBadge } from "./pillar-badge";
import { PLATFORM_COLORS, PlatformIcon } from "./platform-icon";

const COLUMNS = ["#", "Date", "Day", "Platform", "Pillar", "Format", "Time (IST)", "Topic", "Video idea"];

function Head() {
  return (
    <thead>
      <tr className="border-b border-line bg-surface-2">
        {COLUMNS.map((col) => (
          <th
            key={col}
            scope="col"
            className="sticky top-0 z-10 bg-surface-2 px-3 py-3 text-left text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-ink-3 uppercase first:pl-5 last:pr-5"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function PlanTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="scrollbar-thin overflow-x-auto" aria-busy aria-label="Building plan">
      <table className="w-full min-w-[1020px] border-collapse">
        <Head />
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              <td className="py-4 pr-3 pl-5"><div className="skeleton h-3 w-4" /></td>
              <td className="px-3"><div className="skeleton h-3 w-12" /></td>
              <td className="px-3"><div className="skeleton h-3 w-8" /></td>
              <td className="px-3"><div className="skeleton h-5 w-24 rounded-full" /></td>
              <td className="px-3"><div className="skeleton h-5 w-28 rounded-full" /></td>
              <td className="px-3"><div className="skeleton h-3 w-20" /></td>
              <td className="px-3"><div className="skeleton h-3 w-10" /></td>
              <td className="px-3">
                <div className="skeleton h-3 w-[85%]" />
                <div className="skeleton mt-2 h-3 w-[55%]" />
              </td>
              <td className="py-4 pr-5 pl-3">
                <div className="skeleton h-3 w-[95%]" />
                <div className="skeleton mt-2 h-3 w-[80%]" />
                <div className="skeleton mt-2 h-3 w-[40%]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlanTable({
  posts,
  onEdit,
}: {
  posts: Slot[];
  onEdit: (position: number, field: "topic" | "videoIdea", value: string) => void;
}) {
  const startTime = posts.length ? Date.parse(`${posts[0].date}T00:00:00Z`) : 0;
  const weekOf = (post: Slot) =>
    Math.floor((Date.parse(`${post.date}T00:00:00Z`) - startTime) / (7 * 86_400_000));

  return (
    <div className="scrollbar-thin max-h-[78vh] overflow-auto">
      <table className="w-full min-w-[1020px] border-collapse text-sm">
        <Head />
        <tbody>
          {posts.map((post, i) => {
            const postWeek = weekOf(post);
            const newWeek = i === 0 || postWeek !== weekOf(posts[i - 1]);
            return (
              <Fragment key={post.position}>
                {newWeek && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="bg-canvas/60 px-5 py-1.5">
                      <span className="text-[10px] font-semibold tracking-[0.16em] text-ink-3 uppercase">
                        Week {postWeek + 1}
                      </span>
                    </td>
                  </tr>
                )}
                <tr className="group border-b border-line align-top transition-colors last:border-0 hover:bg-surface-2">
                  <td className="py-3.5 pr-3 pl-5 font-mono text-[12px] text-ink-3 tabular-nums">
                    {String(post.position + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-3.5 font-mono text-[12.5px] whitespace-nowrap text-ink">
                    {shortDate(post.date)}
                  </td>
                  <td className="px-3 py-3.5 text-[13px] text-ink-2">{post.weekday}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1.5 text-[12.5px] font-medium whitespace-nowrap text-ink">
                      <span
                        className="grid size-5 place-items-center rounded-full"
                        style={{
                          background: PLATFORM_COLORS[post.platform],
                          color: post.platform === "x" ? "var(--canvas)" : "#fff",
                        }}
                      >
                        <PlatformIcon platform={post.platform} className="size-3" />
                      </span>
                      {PLATFORM_LABELS[post.platform]}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <PillarBadge pillar={post.pillar} />
                  </td>
                  <td className="px-3 py-3.5 text-[13px] text-ink-2">{post.format}</td>
                  <td className="px-3 py-3.5 font-mono text-[12.5px] text-ink tabular-nums">{post.postTime}</td>
                  <td className="w-[24%] min-w-52 px-3 py-3.5">
                    <EditableCell
                      label={`topic for post ${post.position + 1}`}
                      value={post.topic}
                      maxLength={200}
                      emphasis
                      onCommit={(v) => onEdit(post.position, "topic", v)}
                    />
                  </td>
                  <td className="w-[32%] min-w-64 py-3.5 pr-5 pl-3">
                    <EditableCell
                      label={`video idea for post ${post.position + 1}`}
                      value={post.videoIdea}
                      maxLength={600}
                      onCommit={(v) => onEdit(post.position, "videoIdea", v)}
                    />
                    <SourceTag source={post.source} />
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SourceTag({ source }: { source: Slot["source"] }) {
  return (
    <span
      className={cn(
        "mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold tracking-[0.08em] uppercase",
        source === "ai" && "text-accent",
        source === "template" && "text-ink-3",
        source === "edited" && "text-coral",
      )}
    >
      <span className="size-1 rounded-full bg-current" />
      {source === "ai" ? "AI written" : source === "edited" ? "Edited" : "Template"}
    </span>
  );
}
