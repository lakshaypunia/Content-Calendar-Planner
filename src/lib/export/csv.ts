import type { Slot } from "@/lib/validation";
import { EXPORT_HEADERS, exportRow } from "./columns";

const BOM = "﻿";

/** Quotes every cell, doubles inner quotes and defuses spreadsheet formulas. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** UTF-8 BOM so Excel reads emoji and Hindi correctly; CRLF line endings per RFC 4180. */
export function toCsv(posts: Slot[]): string {
  const rows = [EXPORT_HEADERS, ...posts.map(exportRow)];
  return BOM + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function csvFileName(brand: string, startDate: string): string {
  const slug = brand
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "plan"}-plan-${startDate}.csv`;
}

export function downloadCsv(posts: Slot[], brand: string, startDate: string): void {
  const blob = new Blob([toCsv(posts)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = csvFileName(brand, startDate);
  a.click();
  URL.revokeObjectURL(url);
}
