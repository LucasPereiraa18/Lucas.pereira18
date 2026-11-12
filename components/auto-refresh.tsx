"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AUTO_REFRESH_INTERVAL_MS, formatRefreshInterval, shouldPauseAutoRefresh } from "@/src/lib/refresh";

const LIVE_DATA_PATHS = [
  "/painel",
  "/marcacoes",
  "/funcionarios",
  "/cartao-ponto",
  "/justificativas",
  "/fechamento",
];

function hasFocusedEditableElement(): boolean {
  const element = document.activeElement as HTMLElement | null;
  if (!element) return false;
  return element.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName);
}

function formatCountdown(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = String(seconds % 60).padStart(2, "0");
  return `${minutesPart}:${secondsPart}`;
}

export function AutoRefresh() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [remainingMs, setRemainingMs] = useState(AUTO_REFRESH_INTERVAL_MS);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const nextRefreshAt = useRef<number | null>(null);

  const active = LIVE_DATA_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const resetTimer = useCallback((delay = AUTO_REFRESH_INTERVAL_MS) => {
    nextRefreshAt.current = Date.now() + delay;
    setRemainingMs(delay);
  }, []);

  const refreshNow = useCallback(() => {
    startTransition(() => router.refresh());
    setLastUpdatedAt(new Date());
    resetTimer();
  }, [resetTimer, router]);

  useEffect(() => {
    if (!active) return;

    nextRefreshAt.current = Date.now() + AUTO_REFRESH_INTERVAL_MS;

    const timer = window.setInterval(() => {
      const target = nextRefreshAt.current ?? Date.now() + AUTO_REFRESH_INTERVAL_MS;
      const remaining = target - Date.now();
      setRemainingMs(Math.max(0, remaining));
      if (remaining > 0) return;

      const pause = shouldPauseAutoRefresh({
        visibilityState: document.visibilityState as "visible" | "hidden" | "prerender",
        hasFocusedEditable: hasFocusedEditableElement(),
        hasOpenDetails: Boolean(document.querySelector("details[open]")),
      });

      if (pause) {
        resetTimer(10_000);
        return;
      }

      startTransition(() => router.refresh());
      setLastUpdatedAt(new Date());
      resetTimer();
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [active, resetTimer, router]);

  if (!active) return null;

  return (
    <div className="refresh-bar no-print" role="status" aria-live="polite">
      <div className="refresh-bar-inner">
        <div className="refresh-copy">
          <span className={`live-dot ${isPending ? "loading" : ""}`} aria-hidden="true" />
          <div>
            <strong>Dados do Secullum</strong>
            <small>
              {isPending
                ? "Atualizando agora…"
                : `Atualização automática em ${formatCountdown(remainingMs)} · intervalo ${formatRefreshInterval(AUTO_REFRESH_INTERVAL_MS)}`}
              {lastUpdatedAt ? ` · última ${lastUpdatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </small>
          </div>
        </div>
        <button className="button secondary refresh-button" type="button" onClick={refreshNow} disabled={isPending}>
          {isPending ? "Atualizando…" : "Atualizar agora"}
        </button>
      </div>
    </div>
  );
}
