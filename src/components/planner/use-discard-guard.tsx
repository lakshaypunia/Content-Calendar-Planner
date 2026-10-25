"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePlanner } from "./planner-provider";

/**
 * When the plan has unsaved changes, `confirmDiscard()` opens a dialog and
 * resolves true only if the user agrees to throw them away. Also warns on
 * tab close / reload via beforeunload.
 */
export function useDiscardGuard() {
  const { state } = usePlanner();
  const [open, setOpen] = useState(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const dirty = state.isDirty && state.posts.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const confirmDiscard = useCallback(() => {
    if (!dirty) return Promise.resolve(true);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, [dirty]);

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpen(false);
  };

  const dialog = (
    <Dialog open={open} onOpenChange={(o) => !o && settle(false)}>
      <DialogContent
        title="Discard unsaved changes?"
        description="This plan has changes that are not saved. If you continue they will be lost."
      >
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[var(--pillar-bts-soft)] px-3.5 py-3 text-[13px] text-ink-2">
          <AlertTriangle className="size-4 shrink-0 text-[var(--pillar-bts)]" />
          Tip: use Save plan or Update first to keep this version.
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => settle(false)}>
            Keep editing
          </Button>
          <Button variant="danger" onClick={() => settle(true)}>
            Discard changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { confirmDiscard, dialog };
}
