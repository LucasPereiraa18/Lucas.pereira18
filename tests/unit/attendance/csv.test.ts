import { describe, expect, it } from "vitest";
import { toCsv } from "@/src/services/attendance/csv";

describe("CSV export", () => {
  it("adds a UTF-8 BOM and escapes commas and quotes", () => {
    expect(toCsv(["Nome", "Observação"], [["Ana, Maria", 'Disse "ok"']]))
      .toBe('\uFEFFNome,Observação\r\n"Ana, Maria","Disse ""ok"""');
  });
});
