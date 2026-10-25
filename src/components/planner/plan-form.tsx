"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { GOAL_WEIGHTS } from "@/lib/generator/rules";
import { totalPosts } from "@/lib/generator/schedule";
import { GOAL_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import { ApiClientError, apiFetch } from "@/lib/client/api";
import type { GenerateResult } from "@/lib/plan/generate";
import { GOALS, PILLARS, PLATFORMS, PlanInput, type Goal, type PlanInputForm } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { pillarColor } from "./pillar-badge";
import { PLATFORM_COLORS, PlatformIcon } from "./platform-icon";
import { usePlanner } from "./planner-provider";

const GOAL_COPY: Record<Goal, string> = {
  awareness: "Reach new people",
  leads: "Capture enquiries",
  engagement: "Grow conversation",
  sales: "Drive purchases",
};

function localToday(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function SectionLabel({ step, children }: { step: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-6 place-items-center rounded-full bg-ink font-mono text-[11px] text-canvas">
        {step}
      </span>
      <h3 className="text-sm font-semibold text-ink">{children}</h3>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function PlanForm({ confirmDiscard }: { confirmDiscard?: () => Promise<boolean> }) {
  const { state, dispatch } = usePlanner();
  const [defaults] = useState<PlanInputForm>(() => ({
    brand: "",
    niche: "",
    audience: "",
    goal: "engagement",
    postsPerWeek: 3,
    startDate: localToday(),
    platforms: ["instagram", "linkedin"],
    useAi: false,
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PlanInputForm, unknown, PlanInput>({
    resolver: zodResolver(PlanInput),
    defaultValues: defaults,
    mode: "onTouched",
  });

  // When a saved plan is loaded, show its brief in the form.
  useEffect(() => {
    if (state.input) reset(state.input);
  }, [state.revision, state.input, reset]);

  const perWeek = Number(useWatch({ control, name: "postsPerWeek" })) || 0;
  const generating = state.status === "generating";

  const onSubmit = handleSubmit(async (input) => {
    if (confirmDiscard && !(await confirmDiscard())) return;
    dispatch({ type: "generate/start", input });
    try {
      const result = await apiFetch<GenerateResult>("/api/plans/generate", {
        method: "POST",
        body: JSON.stringify(input),
      });
      dispatch({ type: "generate/success", posts: result.posts, ...result.meta });
      if (result.meta.warnings.length) {
        toast.warning(result.meta.warnings.join(" · "));
      } else {
        toast.success(`${result.posts.length} posts planned for ${input.brand}`);
      }
      requestAnimationFrame(() =>
        document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err) {
      dispatch({ type: "generate/error" });
      if (err instanceof ApiClientError && err.fields) {
        for (const [name, message] of Object.entries(err.fields)) {
          setError(name as keyof PlanInputForm, { message });
        }
      }
      toast.error(err instanceof Error ? err.message : "Could not generate the plan");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-md"
      aria-label="Client brief"
    >
      <div className="grid gap-8 p-5 sm:p-8">
        <section>
          <SectionLabel step="01">Client</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand" htmlFor="brand" error={errors.brand?.message}>
              <Input
                id="brand"
                placeholder="e.g. Chai Point"
                autoComplete="organization"
                aria-invalid={!!errors.brand}
                {...register("brand")}
              />
            </Field>
            <Field label="Niche" htmlFor="niche" error={errors.niche?.message}>
              <Input id="niche" placeholder="e.g. Tea cafés" aria-invalid={!!errors.niche} {...register("niche")} />
            </Field>
            <Field
              label="Target audience"
              htmlFor="audience"
              error={errors.audience?.message}
              className="sm:col-span-2"
              hint="Who should every post speak to?"
            >
              <Textarea
                id="audience"
                rows={2}
                placeholder="e.g. Young office workers in Bengaluru who want a quick, healthy break"
                aria-invalid={!!errors.audience}
                {...register("audience")}
              />
            </Field>
          </div>
        </section>

        <section>
          <SectionLabel step="02">Strategy</SectionLabel>
          <Controller
            control={control}
            name="goal"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Goal" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {GOALS.map((goal) => {
                  const active = field.value === goal;
                  return (
                    <button
                      key={goal}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(goal)}
                      className={cn(
                        "group relative cursor-pointer rounded-2xl border p-3.5 text-left transition-all",
                        active
                          ? "border-accent bg-accent-soft/60 shadow-[0_0_0_3px_var(--accent-soft)]"
                          : "border-line-strong bg-surface hover:border-ink-3/50 hover:bg-surface-2",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink">{GOAL_LABELS[goal]}</span>
                        <span
                          className={cn(
                            "grid size-4 place-items-center rounded-full border transition-all",
                            active ? "border-accent bg-accent text-white" : "border-line-strong",
                          )}
                        >
                          {active && <Check className="size-2.5" strokeWidth={3.5} />}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-ink-3">{GOAL_COPY[goal]}</p>
                      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full" aria-hidden>
                        {PILLARS.map((p) => (
                          <span
                            key={p}
                            style={{ width: `${GOAL_WEIGHTS[goal][p]}%`, background: pillarColor(p) }}
                            className="h-full first:rounded-l-full last:rounded-r-full"
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Posts per week"
              htmlFor="postsPerWeek"
              error={errors.postsPerWeek?.message}
              hint={
                <span>
                  ≈ <b className="font-mono font-semibold text-ink">{totalPosts(Math.min(14, Math.max(1, perWeek)))}</b>{" "}
                  posts in 30 days
                </span>
              }
            >
              <Controller
                control={control}
                name="postsPerWeek"
                render={({ field }) => {
                  const value = Number(field.value) || 1;
                  const set = (n: number) => field.onChange(Math.min(14, Math.max(1, n)));
                  return (
                    <div className="flex h-10 items-center gap-3 rounded-xl border border-line-strong bg-surface px-1.5 shadow-sm">
                      <Button size="icon" variant="ghost" aria-label="Fewer posts" onClick={() => set(value - 1)}>
                        <Minus />
                      </Button>
                      <input
                        id="postsPerWeek"
                        type="range"
                        min={1}
                        max={14}
                        value={value}
                        onChange={(e) => set(Number(e.target.value))}
                        onBlur={field.onBlur}
                        className="h-1.5 flex-1 cursor-pointer accent-[var(--accent)]"
                      />
                      <span className="w-6 text-center font-mono text-sm font-semibold tabular-nums">{value}</span>
                      <Button size="icon" variant="ghost" aria-label="More posts" onClick={() => set(value + 1)}>
                        <Plus />
                      </Button>
                    </div>
                  );
                }}
              />
            </Field>
            <Field label="Start date" htmlFor="startDate" error={errors.startDate?.message}>
              <Input
                id="startDate"
                type="date"
                aria-invalid={!!errors.startDate}
                className="font-mono"
                {...register("startDate")}
              />
            </Field>
          </div>
        </section>

        <section>
          <SectionLabel step="03">Channels</SectionLabel>
          <Controller
            control={control}
            name="platforms"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Platforms">
                {PLATFORMS.map((platform) => {
                  const selected = field.value?.includes(platform) ?? false;
                  return (
                    <label
                      key={platform}
                      className={cn(
                        "group relative flex cursor-pointer items-center gap-2.5 rounded-full border py-2 pr-4 pl-2 text-sm font-medium transition-all select-none",
                        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                        selected
                          ? "border-ink bg-ink text-canvas shadow-md"
                          : "border-line-strong bg-surface text-ink-2 hover:border-ink-3/60 hover:text-ink",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          const current = field.value ?? [];
                          // Keep the canonical order so rotation is predictable.
                          const next = e.target.checked
                            ? PLATFORMS.filter((p) => p === platform || current.includes(p))
                            : current.filter((p) => p !== platform);
                          field.onChange(next);
                        }}
                      />
                      <span
                        className={cn(
                          "grid size-7 place-items-center rounded-full transition-colors",
                          selected ? "bg-white" : "bg-canvas",
                        )}
                        style={{ color: platform === "x" ? "#17151c" : PLATFORM_COLORS[platform] }}
                      >
                        <PlatformIcon platform={platform} className="size-3.5" />
                      </span>
                      {PLATFORM_LABELS[platform]}
                      {selected && <Check className="size-3.5 opacity-70" strokeWidth={3} />}
                    </label>
                  );
                })}
              </div>
            )}
          />
          {errors.platforms && (
            <p role="alert" className="mt-2 animate-fade-up text-[12px] font-medium text-danger">
              {errors.platforms.message}
            </p>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-4 border-t border-line bg-surface-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[13px] text-ink-3">
          Schedule, pillars, formats and times are planned by rules, so the same brief always gives the same calendar.
        </p>
        <Button type="submit" size="lg" disabled={generating} className="group sm:min-w-52">
          {generating ? (
            <>
              <Loader2 className="animate-spin" /> Building plan…
            </>
          ) : (
            <>
              <Sparkles /> Generate plan
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
