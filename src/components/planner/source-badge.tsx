import { Blend, FileText, PencilLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SOURCE_LABELS } from "@/lib/labels";
import type { PlanSource } from "@/lib/validation";
import { cn } from "@/lib/utils";

const STYLES: Record<PlanSource, { className: string; icon: typeof Sparkles }> = {
  ai: {
    className: "bg-gradient-to-r from-[#5b3df5] to-[#a845e8] text-white shadow-[0_4px_14px_-4px_#5b3df5]",
    icon: Sparkles,
  },
  template: { className: "bg-canvas text-ink-2 border border-line-strong", icon: FileText },
  mixed: { className: "bg-accent-soft text-accent border border-accent/20", icon: Blend },
  edited: { className: "bg-canvas text-coral border border-coral/30", icon: PencilLine },
};

export function SourceBadge({ source, className }: { source: PlanSource; className?: string }) {
  const { className: style, icon: Icon } = STYLES[source];
  return (
    <Badge className={cn("h-8 gap-1.5 rounded-lg px-2.5 text-[12.5px]", style, className)} data-testid="source-badge">
      <Icon className="size-3.5" />
      {SOURCE_LABELS[source]}
    </Badge>
  );
}
