import { Curriculum, ConceptNode, NodeProgress, SessionLogEntry } from "./types";
import { isDue } from "./spacedRepetition";

export function progressKey(slug: string, nodeId: string) {
  return `${slug}::${nodeId}`;
}

export function masteredCount(curriculum: Curriculum, progress: Record<string, NodeProgress>): number {
  return curriculum.nodes.filter((n) => progress[progressKey(curriculum.slug, n.id)]?.status === "mastered").length;
}

export interface DueItem {
  curriculum: Curriculum;
  node: ConceptNode;
  progress: NodeProgress;
}

export function dueReviews(
  curricula: Record<string, Curriculum>,
  progress: Record<string, NodeProgress>,
  now: Date = new Date(),
): DueItem[] {
  const items: DueItem[] = [];
  for (const curriculum of Object.values(curricula)) {
    for (const node of curriculum.nodes) {
      const p = progress[progressKey(curriculum.slug, node.id)];
      if (p?.status === "mastered" && isDue(p.nextReviewAt, now)) {
        items.push({ curriculum, node, progress: p });
      }
    }
  }
  return items.sort((a, b) => (a.progress.nextReviewAt ?? "").localeCompare(b.progress.nextReviewAt ?? ""));
}

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

/** Cumulative distinct concepts mastered, one point per day that had at least one first-mastery event. */
export function compoundingSeries(sessionLog: SessionLogEntry[]): { date: string; cumulative: number }[] {
  const firstMasteries = sessionLog
    .filter((s) => s.type === "first-mastery")
    .sort((a, b) => a.at.localeCompare(b.at));

  const byDay = new Map<string, number>();
  for (const s of firstMasteries) {
    const key = dayKey(s.at);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const days = Array.from(byDay.keys()).sort();
  let cumulative = 0;
  return days.map((date) => {
    cumulative += byDay.get(date)!;
    return { date, cumulative };
  });
}

/** Session counts per day for the last N days (including empty days), oldest first. */
export function cadenceSeries(sessionLog: SessionLogEntry[], days = 14): { date: string; count: number }[] {
  const byDay = new Map<string, number>();
  for (const s of sessionLog) {
    const key = dayKey(s.at);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const out: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDay.get(key) ?? 0 });
  }
  return out;
}

/** Consecutive days up to today (or yesterday, if today has no session yet) with at least one session. */
export function currentStreak(sessionLog: SessionLogEntry[], now: Date = new Date()): number {
  const days = new Set(sessionLog.map((s) => dayKey(s.at)));
  let streak = 0;
  const cursor = new Date(now);
  // if nothing logged today yet, still allow the streak to count through yesterday
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Average calibration error: |predicted confidence - actual score|, lower is better. Returns null if no data. */
export function calibrationError(sessionLog: SessionLogEntry[]): number | null {
  if (sessionLog.length === 0) return null;
  const total = sessionLog.reduce((sum, s) => sum + Math.abs(s.confidencePrediction - s.quizScore), 0);
  return Math.round(total / sessionLog.length);
}

export function lastSessionAt(sessionLog: SessionLogEntry[]): Date | null {
  if (sessionLog.length === 0) return null;
  return new Date(sessionLog.reduce((latest, s) => (s.at > latest ? s.at : latest), sessionLog[0].at));
}
