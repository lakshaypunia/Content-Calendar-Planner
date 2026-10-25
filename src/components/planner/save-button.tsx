"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client/api";
import { clientsKey, planKey } from "./client-sidebar";
import { usePlanner } from "./planner-provider";

export function SaveButton() {
  const { state, dispatch } = usePlanner();
  const queryClient = useQueryClient();
  const { input, posts, savedPlanId, isDirty } = state;

  const save = useMutation({
    mutationFn: async () => {
      if (!input) throw new Error("Nothing to save");
      if (savedPlanId) {
        await apiFetch(`/api/plans/${savedPlanId}`, { method: "PUT", body: JSON.stringify({ posts }) });
        return savedPlanId;
      }
      const { id } = await apiFetch<{ id: string }>("/api/plans", {
        method: "POST",
        body: JSON.stringify({ input, posts }),
      });
      return id;
    },
    onSuccess: (id) => {
      toast.success(savedPlanId ? "Changes saved" : `Saved under ${input?.brand}`);
      dispatch({ type: "plan/saved", id });
      queryClient.invalidateQueries({ queryKey: clientsKey });
      queryClient.removeQueries({ queryKey: planKey(id) });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!input || !posts.length) return null;

  if (savedPlanId && !isDirty) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-success disabled:opacity-100">
        <Check /> Saved
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
      {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
      {savedPlanId ? "Update" : "Save plan"}
    </Button>
  );
}
