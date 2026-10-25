"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Click to edit. Enter or blur commits, Shift+Enter adds a line break,
 * Esc cancels.
 */
export function EditableCell({
  value,
  onCommit,
  maxLength,
  label,
  emphasis = false,
}: {
  value: string;
  onCommit: (value: string) => void;
  maxLength: number;
  label: string;
  emphasis?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  const cancelled = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, draft]);

  const start = () => {
    setDraft(value);
    cancelled.current = false;
    setEditing(true);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(ref.current.value.length, ref.current.value.length);
    });
  };

  const commit = () => {
    setEditing(false);
    if (cancelled.current) return;
    const next = draft.trim();
    if (next && next !== value) onCommit(next);
  };

  if (editing) {
    return (
      <textarea
        ref={ref}
        aria-label={label}
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "-mx-2 -my-1.5 block w-[calc(100%+1rem)] resize-none overflow-hidden rounded-lg border border-accent bg-surface px-2 py-1.5 leading-relaxed text-ink shadow-[0_0_0_4px_var(--accent-soft)] outline-none",
          emphasis ? "text-[13.5px] font-medium" : "text-[13px]",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      aria-label={`Edit ${label}`}
      className={cn(
        "group/cell -mx-2 -my-1.5 flex w-[calc(100%+1rem)] cursor-text items-start gap-2 rounded-lg px-2 py-1.5 text-left leading-relaxed transition-colors hover:bg-accent-soft/50",
        emphasis ? "text-[13.5px] font-medium text-ink" : "text-[13px] text-ink-2",
      )}
    >
      <span className="flex-1">{value}</span>
      <PencilLine className="mt-0.5 size-3.5 shrink-0 text-accent opacity-0 transition-opacity group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100" />
    </button>
  );
}
