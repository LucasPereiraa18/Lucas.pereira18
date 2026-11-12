export interface SecullumEmployee {
  id: string | number;
  name: string;
  cpf: string;
  functionDescription: string | null;
  departmentDescription: string | null;
  dismissalDate: string | null;
  active: boolean;
}

export interface SecullumPunchDayRaw {
  Data?: string;
  Entrada1?: string | null;
  Saida1?: string | null;
  Entrada2?: string | null;
  Saida2?: string | null;
  Entrada3?: string | null;
  Saida3?: string | null;
  Entrada4?: string | null;
  Saida4?: string | null;
  Entrada5?: string | null;
  Saida5?: string | null;
  MemoriaEntrada1?: string | null;
  MemoriaSaida1?: string | null;
  MemoriaEntrada2?: string | null;
  MemoriaSaida2?: string | null;
  Folga?: boolean;
  Compensado?: boolean;
  Observacoes?: string | null;
  Abono2?: unknown;
  Abono3?: unknown;
  Abono4?: unknown;
  [key: string]: unknown;
}

export interface SecullumPunchDay {
  date: string;
  entries: Array<string | null>;
  exits: Array<string | null>;
  memoryEntries: Array<string | null>;
  memoryExits: Array<string | null>;
  dayOff: boolean;
  compensated: boolean;
  observations: string | null;
  allowances: unknown[];
  raw: SecullumPunchDayRaw;
}
