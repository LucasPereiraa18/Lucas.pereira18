import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const files = ["README.md", "docs/OPERACAO.md", "docs/FECHAMENTO.md", "docs/SEGURANCA.md"];
const text = files.map((path) => readFileSync(path, "utf8")).join("\n").toLowerCase();

describe("operational documentation", () => {
  it.each(files)("contains %s", (path) => expect(() => readFileSync(path, "utf8")).not.toThrow());
  it("documents configuration, REP diagnosis, closing and secrets", () => {
    for (const term of ["secullum_encryption_key", "rep", "fechamento", "somente leitura", "não vira falta automaticamente"]) expect(text).toContain(term);
  });
});
