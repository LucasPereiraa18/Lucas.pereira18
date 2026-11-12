import { formatDuration } from "@/src/domain/time/clock";

export function Duration({ minutes }: { minutes: number | null }) {
  return <span className="numeric">{formatDuration(minutes)}</span>;
}
