"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, ClipboardCopy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { downloadCsv } from "@/lib/export/csv";
import { copyForSheets } from "@/lib/export/tsv";
import { usePlanner } from "./planner-provider";
import { SourceBadge } from "./source-badge";

export function PlanToolbar({ children }: { children?: ReactNode }) {
  const { state } = usePlanner();
  const [copied, setCopied] = useState(false);
  const { input, posts } = state;
  if (!input || !posts.length) return null;

  const copy = async () => {
    try {
      await copyForSheets(posts);
      setCopied(true);
      toast.success("Copied. Paste into cell A1 of a Google Sheet.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard is blocked by the browser");
    }
  };

  return (
    <>
      {state.source && <SourceBadge source={state.source} />}
      {children}
      <Tooltip content="Excel and Google Sheets friendly">
        <Button variant="secondary" size="sm" onClick={() => downloadCsv(posts, input.brand, input.startDate)}>
          <Download /> CSV
        </Button>
      </Tooltip>
      <Button variant="secondary" size="sm" onClick={copy}>
        {copied ? <Check className="text-success" /> : <ClipboardCopy />}
        {copied ? "Copied" : "Copy for Sheets"}
      </Button>
    </>
  );
}
