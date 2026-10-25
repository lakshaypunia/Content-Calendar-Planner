import { describe, expect, it } from "vitest";
import type { Slot } from "@/lib/validation";
import { csvCell, csvFileName, toCsv } from "./csv";
import { toTsv } from "./tsv";

const slot: Slot = {
  position: 0,
  date: "2026-11-01",
  weekday: "Sun",
  platform: "instagram",
  pillar: "educational",
  format: "Reel",
  postTime: "11:00",
  topic: 'Say "chai" ☕ — चाय का समय',
  videoIdea: "Line one\nline\ttwo",
  source: "template",
};

describe("csvCell", () => {
  it("quotes every cell and doubles inner quotes", () => {
    expect(csvCell("plain")).toBe('"plain"');
    expect(csvCell('a "b" c')).toBe('"a ""b"" c"');
  });

  it.each(["=SUM(A1)", "+1", "-1", "@cmd"])("prefixes formula-like %s with a quote", (v) => {
    expect(csvCell(v)).toBe(`"'${v}"`);
  });
});

describe("toCsv", () => {
  const csv = toCsv([slot]);

  it("starts with a UTF-8 BOM and a header row", () => {
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1).split("\r\n")[0]).toBe(
      '"#","Date","Day","Platform","Pillar","Format","Time (IST)","Topic","Video idea"',
    );
  });

  it("keeps emoji, Hindi and embedded newlines inside quoted cells", () => {
    expect(csv).toContain('"Say ""chai"" ☕ — चाय का समय"');
    expect(csv).toContain('"Line one\nline\ttwo"');
    expect(csv).toContain('"Instagram","Educational"');
  });
});

describe("csvFileName", () => {
  it("slugs the brand", () => {
    expect(csvFileName("Chai Point & Co.", "2026-11-01")).toBe("chai-point-co-plan-2026-11-01.csv");
    expect(csvFileName("Café Été", "2026-11-01")).toBe("cafe-ete-plan-2026-11-01.csv");
    expect(csvFileName("☕", "2026-11-01")).toBe("plan-plan-2026-11-01.csv");
  });
});

describe("toTsv", () => {
  it("joins cells with tabs, rows with newlines and flattens tabs/newlines inside cells", () => {
    const lines = toTsv([slot]).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0].split("\t")).toHaveLength(9);
    const cells = lines[1].split("\t");
    expect(cells).toHaveLength(9);
    expect(cells[8]).toBe("Line one line two");
  });
});
