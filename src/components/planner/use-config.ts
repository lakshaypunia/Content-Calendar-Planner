"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client/api";

/** null while loading. */
export function useAiAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    apiFetch<{ aiAvailable: boolean }>("/api/config")
      .then((c) => active && setAvailable(c.aiAvailable))
      .catch(() => active && setAvailable(false));
    return () => {
      active = false;
    };
  }, []);
  return available;
}
