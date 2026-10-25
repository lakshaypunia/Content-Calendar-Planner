import { Badge } from "@/components/ui/badge";
import { PILLAR_LABELS } from "@/lib/labels";
import type { Pillar } from "@/lib/validation";
import { cn } from "@/lib/utils";

const VAR: Record<Pillar, string> = {
  educational: "educational",
  behind_the_scenes: "bts",
  social_proof: "proof",
  promotional: "promo",
  entertaining: "fun",
};

export function pillarColor(pillar: Pillar, soft = false): string {
  return `var(--pillar-${VAR[pillar]}${soft ? "-soft" : ""})`;
}

export function PillarDot({ pillar, className }: { pillar: Pillar; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ background: pillarColor(pillar) }}
    />
  );
}

export function PillarBadge({ pillar }: { pillar: Pillar }) {
  return (
    <Badge style={{ background: pillarColor(pillar, true), color: pillarColor(pillar) }}>
      <PillarDot pillar={pillar} className="size-1.5" />
      {PILLAR_LABELS[pillar]}
    </Badge>
  );
}
