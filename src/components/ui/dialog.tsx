"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const overlay = "fixed inset-0 z-50 animate-overlay-in bg-[#0b0a10]/45 backdrop-blur-[3px]";

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlay} />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 animate-dialog-in",
          "rounded-2xl border border-line bg-surface p-6 shadow-lg focus:outline-none",
          className,
        )}
      >
        <DialogPrimitive.Title className="pr-8 font-display text-[26px] leading-tight text-ink">
          {title}
        </DialogPrimitive.Title>
        {description && (
          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-ink-2">
            {description}
          </DialogPrimitive.Description>
        )}
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Left-edge drawer, used for the sidebar on small screens. */
export function SheetContent({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlay} />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[300px] animate-sheet-in flex-col shadow-lg focus:outline-none"
      >
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
