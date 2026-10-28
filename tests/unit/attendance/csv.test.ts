import { describe, expect, it } from "vitest";
import { toCsv } from "@/src/services/attendance/csv";

describe("toCsv", () => {
  it("escapes quotes, commas and preserves UTF-8 BOM", () => {
    const csv = toCsv(["Nome", "Obs"], [["Ana", 'texto, com "aspas"']]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"texto, com ""aspas"""');
  });

  it("neutralizes spreadsheet formulas from exported data", () => {
    const csv = toCsv(["Nome"], [["=HYPERLINK(\"https://example.invalid\")"], [" +SUM(1,1)"], ["@cmd"]]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("' +SUM");
    expect(csv).toContain("'@cmd");
  });
});
