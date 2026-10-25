"use client";

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import type { PlanInput, PlanSource, Slot } from "@/lib/validation";

export type Status = "idle" | "generating" | "ready";

export interface PlannerState {
  input: PlanInput | null;
  posts: Slot[];
  source: PlanSource | null;
  warnings: string[];
  savedPlanId: string | null;
  isDirty: boolean;
  status: Status;
  /** Bumped whenever a new plan lands, so the form can reset to it. */
  revision: number;
}

export type PlannerAction =
  | { type: "generate/start"; input: PlanInput }
  | { type: "generate/success"; posts: Slot[]; source: PlanSource; warnings: string[] }
  | { type: "generate/error" }
  | { type: "post/edit"; position: number; field: "topic" | "videoIdea"; value: string }
  | { type: "plan/loaded"; id: string; input: PlanInput; posts: Slot[]; source: PlanSource }
  | { type: "plan/saved"; id: string }
  | { type: "plan/reset" };

export const initialPlannerState: PlannerState = {
  input: null,
  posts: [],
  source: null,
  warnings: [],
  savedPlanId: null,
  isDirty: false,
  status: "idle",
  revision: 0,
};

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case "generate/start":
      return { ...state, input: action.input, status: "generating" };
    case "generate/success":
      return {
        ...state,
        posts: action.posts,
        source: action.source,
        warnings: action.warnings,
        savedPlanId: null,
        isDirty: true,
        status: "ready",
        revision: state.revision + 1,
      };
    case "generate/error":
      return { ...state, status: state.posts.length ? "ready" : "idle" };
    case "post/edit": {
      let changed = false;
      const posts = state.posts.map((post) => {
        if (post.position !== action.position || post[action.field] === action.value) return post;
        changed = true;
        return { ...post, [action.field]: action.value, source: "edited" as const };
      });
      return changed ? { ...state, posts, isDirty: true } : state;
    }
    case "plan/loaded":
      return {
        ...state,
        input: action.input,
        posts: action.posts,
        source: action.source,
        warnings: [],
        savedPlanId: action.id,
        isDirty: false,
        status: "ready",
        revision: state.revision + 1,
      };
    case "plan/saved":
      return { ...state, savedPlanId: action.id, isDirty: false };
    case "plan/reset":
      return { ...initialPlannerState, revision: state.revision + 1 };
  }
}

const PlannerContext = createContext<{ state: PlannerState; dispatch: Dispatch<PlannerAction> } | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(plannerReducer, initialPlannerState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside PlannerProvider");
  return ctx;
}
