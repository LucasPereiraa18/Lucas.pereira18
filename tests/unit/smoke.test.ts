import { describe, expect, it } from "vitest";
import { APP_TIME_ZONE } from "@/src/domain/time/types";

describe("project defaults", () => {
  it("uses the Bar Líder timezone", () => {
    expect(APP_TIME_ZONE).toBe("America/Sao_Paulo");
  });
});
