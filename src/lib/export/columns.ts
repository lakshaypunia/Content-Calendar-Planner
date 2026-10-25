import { PILLAR_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import type { Slot } from "@/lib/validation";

export const EXPORT_HEADERS = ["#", "Date", "Day", "Platform", "Pillar", "Format", "Time (IST)", "Topic", "Video idea"];

export function exportRow(slot: Slot): string[] {
  return [
    String(slot.position + 1),
    slot.date,
    slot.weekday,
    PLATFORM_LABELS[slot.platform],
    PILLAR_LABELS[slot.pillar],
    slot.format,
    slot.postTime,
    slot.topic,
    slot.videoIdea,
  ];
}
