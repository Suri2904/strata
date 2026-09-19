"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";
import { Topic } from "@/lib/types";
import { calibrationStats } from "@/lib/selectors";

const PASSCODE_KEY = "strata_passcode";

type SyncState = "idle" | "working" | "no-passcode" | "unauthorized" | "error";

export default function SettingsPage() {
  const topics = useStrataStore((s) => s.topics);
  const calibrationLog = useStrataStore((s) => s.calibrationLog);
  const replaceAllTopics = useStrataStore((s) => s.replaceAllTopics);
  const resetAll = useStrataStore((s) => s.resetAll);
  const stats = calibrationStats(calibrationLog);

  const [passcode, setPasscode] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState("");

  // Reading localStorage inside a lazy useState initializer would make the very first client
  // render (during hydration) disagree with the server's static-prerendered HTML — e.g. a
  // disabled={!passcode} button would render disabled on the server but not on the client,
  // a genuine hydration mismatch, not just a lint nag. An effect runs only after hydration
  // completes, so this update lands as an ordinary post-hydration re-render instead.
  useEffect(() => {
    const stored = localStorage.getItem(PASSCODE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setPasscode(stored);
  }, []);

  function savePasscode(value: string) {
    setPasscode(value);
    localStorage.setItem(PASSCODE_KEY, value);
  }

  async function backup() {
    setState("working");
    setMessage("");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-strata-passcode": passcode },
        body: JSON.stringify({ topics }),
      });
      const body = await res.json();
      if (res.status === 501) {
        setState("no-passcode");
        return;
      }
      if (res.status === 401) {
        setState("unauthorized");
        return;
      }
      if (!res.ok) {
        setMessage(body.message ?? "Couldn't back up right now.");
        setState("error");
        return;
      }
      setLastSyncedAt(body.syncedAt);
      setState("idle");
      setMessage(`Backed up ${topics.length} topic${topics.length === 1 ? "" : "s"}.`);
    } catch {
      setMessage("Couldn't reach the server. Check your connection and try again.");
      setState("error");
    }
  }

  async function restore() {
    if (!window.confirm("This replaces everything on this device with the cloud backup. Continue?")) return;
    setState("working");
    setMessage("");
    try {
      const res = await fetch("/api/sync", { headers: { "x-strata-passcode": passcode } });
      const body = await res.json();
      if (res.status === 501) {
        setState("no-passcode");
        return;
      }
      if (res.status === 401) {
        setState("unauthorized");
        return;
      }
      if (!res.ok) {
        setMessage(body.message ?? "Couldn't restore right now.");
        setState("error");
        return;
      }
      replaceAllTopics(body.topics as Topic[]);
      setLastSyncedAt(body.syncedAt);
      setState("idle");
      setMessage(`Restored ${(body.topics as Topic[]).length} topic${body.topics.length === 1 ? "" : "s"} from the cloud.`);
    } catch {
      setMessage("Couldn't reach the server. Check your connection and try again.");
      setState("error");
    }
  }

  function handleReset() {
    if (!window.confirm("Delete all topics and progress on this device? This can't be undone.")) return;
    resetAll();
    setMessage("All local data cleared.");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>

        <section className="mt-10 border-t border-[var(--border-hairline)] pt-8">
          <h2 className="font-display text-base">Cloud backup</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Everything lives in this browser by default. Set a passcode to back up to, or restore from, the cloud.
          </p>

          <label className="mt-6 block text-xs font-medium text-[var(--ink-soft)]" htmlFor="passcode">
            Passcode
          </label>
          <input
            id="passcode"
            type="password"
            value={passcode}
            onChange={(e) => savePasscode(e.target.value)}
            placeholder="Your sync passcode"
            className="mt-2 w-full border-b border-[var(--border-strong)] bg-transparent py-2 text-base outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
          />

          {state === "no-passcode" && (
            <p className="mt-3 text-sm text-[var(--warning)]">
              Sync isn&apos;t configured on the server yet — set SYNC_PASSCODE in the deployment&apos;s environment.
            </p>
          )}
          {state === "unauthorized" && <p className="mt-3 text-sm text-[var(--warning)]">Wrong passcode.</p>}
          {state === "error" && <p className="mt-3 text-sm text-[var(--warning)]">{message}</p>}
          {(state === "idle" || state === "working") && message && (
            <p className="mt-3 text-sm text-[var(--good)]">{message}</p>
          )}
          {lastSyncedAt && <p className="mt-2 text-xs text-[var(--ink-faint)]">Last synced {new Date(lastSyncedAt).toLocaleString()}</p>}

          <div className="mt-5 flex gap-3">
            <button
              onClick={backup}
              disabled={state === "working" || !passcode}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
              style={{ background: "var(--ink)" }}
            >
              Back up to cloud
            </button>
            <button
              onClick={restore}
              disabled={state === "working" || !passcode}
              className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Restore from cloud
            </button>
          </div>
        </section>

        <section className="mt-10 border-t border-[var(--border-hairline)] pt-8">
          <h2 className="font-display text-base">Calibration</h2>
          {stats ? (
            <div className="mt-3 space-y-1.5 text-sm text-[var(--ink-soft)]">
              <p>
                Across {stats.count} graded answer{stats.count === 1 ? "" : "s"}, your confidence was off by{" "}
                <span className="font-medium text-[var(--ink)]">{stats.meanAbsError} points</span> on average (0–100
                scale).
              </p>
              <p>
                {Math.abs(stats.bias) < 5
                  ? "Your confidence tracks your actual accuracy well."
                  : stats.bias < 0
                    ? `You tend to run overconfident — actual scores come in ${Math.abs(stats.bias)} points below what you predicted, on average.`
                    : `You tend to run underconfident — actual scores come in ${stats.bias} points above what you predicted, on average.`}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              No graded answers yet — calibration tracks how well your confidence matches your actual scores.
            </p>
          )}
        </section>

        <section className="mt-10 border-t border-[var(--border-hairline)] pt-8">
          <h2 className="font-display text-base">Local data</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {topics.length} topic{topics.length === 1 ? "" : "s"} stored on this device.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 rounded-lg border border-[var(--warning)] px-4 py-2 text-sm font-semibold text-[var(--warning)]"
          >
            Reset all local data
          </button>
        </section>
      </main>
    </div>
  );
}
