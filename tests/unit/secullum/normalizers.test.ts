import { describe, expect, it } from "vitest";
import { normalizeEmployee, normalizePunchDay } from "@/src/services/secullum/normalizers";

describe("Secullum normalizers", () => {
  it("reads nested function/department descriptions and active state", () => {
    expect(normalizeEmployee({ Id: 7, Nome: " Ana ", Cpf: "123.456.789-00", Funcao: { Descricao: "Cozinha" }, Departamento: { Descricao: "Loja" }, Demissao: null })).toMatchObject({
      id: 7, name: "Ana", cpf: "12345678900", functionDescription: "Cozinha", departmentDescription: "Loja", active: true,
    });
  });

  it("preserves textual punch fields instead of turning them into zero", () => {
    const day = normalizePunchDay({ Data: "2026-10-27", Entrada1: "FOLGA", Saida1: null });
    expect(day.entries[0]).toBe("FOLGA");
    expect(day.exits[0]).toBeNull();
  });
});
