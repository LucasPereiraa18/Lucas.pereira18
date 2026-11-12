import type { SecullumEmployee } from "@/src/domain/secullum/types";

export function EmployeeSelector({ employees, value }: { employees: SecullumEmployee[]; value?: string }) {
  return (
    <label className="field">
      <span>Colaborador</span>
      <select name="cpf" defaultValue={value}>
        {employees.map((employee) => <option key={employee.cpf} value={employee.cpf}>{employee.name}</option>)}
      </select>
    </label>
  );
}
