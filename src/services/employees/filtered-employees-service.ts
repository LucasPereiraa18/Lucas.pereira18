import type { SecullumEmployee } from "@/src/domain/secullum/types";
import { listHiddenEmployeeCpfs } from "@/src/repositories/hidden-employee-repository";
import { createSecullumClient } from "@/src/services/secullum/client-factory";
import { getEmployees } from "@/src/services/secullum/employees-service";

export async function getEmployeesWithVisibility(includeInactive = false): Promise<Array<{ employee: SecullumEmployee; hidden: boolean }>> {
  const hidden = await listHiddenEmployeeCpfs();
  const employees = await getEmployees(await createSecullumClient());
  return employees
    .filter((employee) => includeInactive || employee.active)
    .map((employee) => ({ employee, hidden: hidden.has(employee.cpf) }));
}

export async function getVisibleEmployees(includeInactive = false): Promise<SecullumEmployee[]> {
  return (await getEmployeesWithVisibility(includeInactive))
    .filter((item) => !item.hidden)
    .map((item) => item.employee);
}
