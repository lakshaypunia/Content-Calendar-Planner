"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientSidebar } from "./client-sidebar";
import { PlanForm } from "./plan-form";
import { PlanPanel } from "./plan-panel";
import { PlanToolbar } from "./plan-toolbar";
import { PlannerProvider, usePlanner } from "./planner-provider";
import { SaveButton } from "./save-button";
import { useDiscardGuard } from "./use-discard-guard";

function Hero() {
  return (
    <header className="animate-fade-up">
      <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3 py-1 text-[12px] font-medium text-ink-2 shadow-sm backdrop-blur">
        <span className="size-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgb(31_157_107/0.2)]" />
        30-day posting plans for agencies
      </p>
      <h1 className="mt-5 max-w-3xl font-display text-[44px] leading-[1.02] tracking-tight text-ink sm:text-[60px]">
        Plan a month of content, <em className="text-accent">in one go.</em>
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">
        Brief us on the client. Cadence picks posting days, platforms, content pillars, formats and the best
        times, then writes a topic and video idea for every slot.
      </p>
    </header>
  );
}

function Workspace() {
  const { dispatch } = usePlanner();
  const { confirmDiscard, dialog } = useDiscardGuard();
  const newPlan = async () => {
    if (await confirmDiscard()) dispatch({ type: "plan/reset" });
  };
  return (
    <AppShell sidebar={<ClientSidebar confirmDiscard={confirmDiscard} />} onNewPlan={newPlan}>
      {dialog}
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        <Hero />
        <div className="animate-fade-up [animation-delay:80ms]">
          <PlanForm confirmDiscard={confirmDiscard} />
        </div>
        <PlanPanel
          toolbar={
            <PlanToolbar>
              <SaveButton />
            </PlanToolbar>
          }
        />
      </div>
    </AppShell>
  );
}

export function Planner() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <PlannerProvider>
        <TooltipProvider>
          <Workspace />
        </TooltipProvider>
      </PlannerProvider>
    </QueryClientProvider>
  );
}
