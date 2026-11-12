import Link from "next/link";

export function StatusState({ title, description, actionHref, actionLabel, tone = "neutral" }: { title: string; description: string; actionHref?: string; actionLabel?: string; tone?: "neutral" | "warning" | "error" | "success" }) {
  return (
    <section className={`status-state ${tone}`}>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionHref && actionLabel ? <Link className="button secondary" href={actionHref}>{actionLabel}</Link> : null}
    </section>
  );
}
