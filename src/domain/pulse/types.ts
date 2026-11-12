export interface PulseConfig {
  caps: { attendance: number; score: number; collective: number; podium: Record<string, number> };
  life: { delay_per_hour: number; absence: number; medical: number; sanction: number };
  punctuality: { weight: number; early_tolerance: number; interval_tolerance: number; late_exit_tolerance: number };
  collectiveWeights: { sanitary: number; delivery: number; errors: number };
  programName: string;
}

export interface PulseCollectiveInput {
  sanitaryScore: number | null;
  deliveryScore: number | null;
  operationalErrors: number | null;
}

export interface PulseCollectiveResult {
  percent: number;
  legs: Array<{ key: string; label: string; value: number; nominalWeight: number; effectiveWeight: number }>;
  measuredWeight: number;
}

export interface PulsePunctualityDay {
  date: string;
  score: number | null;
  deviationMinutes: number;
  reason: string;
  onTime: boolean | null;
}

export interface PulseEmployeeResult {
  cpf: string;
  name: string;
  lifePercent: number;
  punctualityPercent: number | null;
  daysMeasured: number;
  daysOnTime: number;
  sequenceOnTime: number;
  totalOnTime: number;
  executionRate: number | null;
  assigned: number;
  completed: number;
  points: number;
  collectivePercent: number;
  attendanceAmount: number;
  scoreAmount: number;
  collectiveAmount: number;
  podiumAmount: number;
  totalAmount: number;
  rankPosition: number;
  delayMinutes: number;
  absences: number;
  medicalCertificates: number;
  sanctions: number;
  xpTotal: number;
  level: number;
  levelName: string;
  nextLevelXp: number | null;
  coins: number;
  achievementCount: number;
  punctualityDays: PulsePunctualityDay[];
}
