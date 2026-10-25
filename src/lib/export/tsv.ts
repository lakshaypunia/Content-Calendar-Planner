import type { Slot } from "@/lib/validation";
import { EXPORT_HEADERS, exportRow } from "./columns";

function tsvCell(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ");
}

/** Header + rows, tab-separated, so a paste into Google Sheets fills separate columns. */
export function toTsv(posts: Slot[]): string {
  return [EXPORT_HEADERS, ...posts.map(exportRow)].map((row) => row.map(tsvCell).join("\t")).join("\n");
}

export function copyForSheets(posts: Slot[]): Promise<void> {
  return navigator.clipboard.writeText(toTsv(posts));
}
