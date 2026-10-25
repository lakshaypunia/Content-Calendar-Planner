"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DatabaseZap, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import type { ClientWithPlans, StoredPlan } from "@/db/queries";
import { ApiClientError, apiFetch } from "@/lib/client/api";
import { cn } from "@/lib/utils";
import { usePlanner } from "./planner-provider";

export const clientsKey = ["clients"] as const;
export const planKey = (id: string) => ["plan", id] as const;

const AVATAR_GRADIENTS = [
  "from-[#7c63ff] to-[#5b3df5]",
  "from-[#ff8a6b] to-[#e5484d]",
  "from-[#3ec78f] to-[#1f9d6b]",
  "from-[#f0a254] to-[#d9822b]",
  "from-[#6b95ff] to-[#2f6bff]",
  "from-[#c47bf5] to-[#a845e8]",
];

function gradientFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-white/35 uppercase">{children}</p>;
}

export function ClientSidebar({ confirmDiscard }: { confirmDiscard?: () => Promise<boolean> }) {
  const { state, dispatch } = usePlanner();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string; client: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const clients = useQuery({
    queryKey: clientsKey,
    queryFn: () => apiFetch<ClientWithPlans[]>("/api/clients"),
    retry: (count, err) => !(err instanceof ApiClientError && err.status === 500) && count < 2,
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/plans/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      if (state.savedPlanId === id) dispatch({ type: "plan/detached" });
      queryClient.removeQueries({ queryKey: planKey(id) });
      toast.success("Plan deleted");
      setPendingDelete(null);
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: clientsKey }),
  });

  const open = async (id: string) => {
    if (id === state.savedPlanId) return;
    if (confirmDiscard && !(await confirmDiscard())) return;
    setLoadingId(id);
    try {
      const plan = await queryClient.fetchQuery({
        queryKey: planKey(id),
        queryFn: () => apiFetch<StoredPlan>(`/api/plans/${id}`),
        staleTime: 0,
      });
      dispatch({ type: "plan/loaded", id, ...plan });
      requestAnimationFrame(() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load the plan");
    } finally {
      setLoadingId(null);
    }
  };

  let body: React.ReactNode;
  if (clients.isPending) {
    body = (
      <div className="space-y-4 px-3 pt-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 opacity-40">
            <div className="size-8 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-2/3 rounded bg-white/10" />
              <div className="h-2 w-1/3 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (clients.isError) {
    body = (
      <div className="mx-1 mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <DatabaseZap className="size-5 text-[#ff8a6b]" />
        <p className="mt-2 text-[13px] font-medium text-white/80">Saved plans unavailable</p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/40">{clients.error.message}</p>
        <button
          type="button"
          onClick={() => clients.refetch()}
          className="mt-3 cursor-pointer text-[12px] font-medium text-[#a898ff] hover:text-white"
        >
          Try again
        </button>
      </div>
    );
  } else if (clients.data.length === 0) {
    body = (
      <div className="mx-1 mt-3 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center">
        <FolderOpen className="mx-auto size-5 text-white/30" />
        <p className="mt-2 text-[13px] text-white/60">No saved plans yet</p>
        <p className="mt-1 text-[12px] text-white/35">Plans you save appear here, grouped by client.</p>
      </div>
    );
  } else {
    body = (
      <ul className="mt-2 space-y-4">
        {clients.data.map((client) => (
          <li key={client.id}>
            <div className="flex items-center gap-2.5 px-3 py-1.5">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-[12px] font-semibold text-white",
                  gradientFor(client.name),
                )}
              >
                {client.name.trim()[0]?.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-white">{client.name}</span>
              <span className="font-mono text-[11px] text-white/30">{client.plans.length}</span>
            </div>
            <ul className="mt-0.5 ml-[25px] border-l border-white/[0.07] pl-2">
              {client.plans.map((plan) => {
                const active = plan.id === state.savedPlanId;
                return (
                  <li key={plan.id} className="group relative">
                    <button
                      type="button"
                      data-close-sheet
                      onClick={() => open(plan.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-9 pl-2.5 text-left transition-colors",
                        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white",
                      )}
                    >
                      {active && <span className="absolute top-2 bottom-2 -left-[9px] w-0.5 rounded-full bg-[#a898ff]" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px]">{plan.title}</span>
                        <span className="block text-[11px] text-white/30">{relativeDate(plan.createdAt)}</span>
                      </span>
                      {loadingId === plan.id && <Loader2 className="size-3.5 animate-spin text-white/50" />}
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${plan.title}`}
                      onClick={() => setPendingDelete({ id: plan.id, title: plan.title, client: client.name })}
                      className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-white/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#e5484d]/20 hover:text-[#ff8a8a] focus-visible:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="px-1">
      <SectionTitle>Clients</SectionTitle>
      {body}

      <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        {pendingDelete && (
          <DialogContent
            title="Delete this plan?"
            description={
              <>
                <b className="font-medium text-ink">{pendingDelete.title}</b> for {pendingDelete.client} and all of
                its posts will be removed. This cannot be undone.
              </>
            }
          >
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate(pendingDelete.id)}>
                {remove.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Delete plan
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
