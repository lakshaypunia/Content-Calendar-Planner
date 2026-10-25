import { PILLARS, type Goal, type Pillar } from "@/lib/validation";
import { GOAL_WEIGHTS } from "./rules";

/**
 * Smooth weighted round-robin (as in nginx): each step every pillar gains its
 * weight, the highest is picked and pays back the total. Over any prefix the
 * counts stay within one of the exact proportion. Ties go to PILLARS order.
 */
function weightedSequence(goal: Goal, total: number): Pillar[] {
  const weights = GOAL_WEIGHTS[goal];
  const sum = PILLARS.reduce((acc, p) => acc + weights[p], 0);
  const current = Object.fromEntries(PILLARS.map((p) => [p, 0])) as Record<Pillar, number>;
  const result: Pillar[] = [];

  for (let i = 0; i < total; i++) {
    let best: Pillar = PILLARS[0];
    for (const p of PILLARS) {
      current[p] += weights[p];
      if (current[p] > current[best]) best = p;
    }
    current[best] -= sum;
    result.push(best);
  }
  return result;
}

const isPromo = (p: Pillar) => p === "promotional";

/**
 * Pillar per post for a goal. Guards: post 0 is never promotional and two
 * promotional posts never run back to back (swap with the next non-promotional
 * pick, which keeps the overall mix intact).
 */
export function assignPillars(goal: Goal, total: number): Pillar[] {
  const seq = weightedSequence(goal, total);

  for (let i = 0; i < seq.length; i++) {
    if (!isPromo(seq[i]) || (i > 0 && !isPromo(seq[i - 1]))) continue;
    const j = seq.findIndex((p, k) => k > i && !isPromo(p));
    if (j !== -1) {
      [seq[i], seq[j]] = [seq[j], seq[i]];
    } else {
      // Only promos remain after i; fall back to the goal's strongest non-promo pillar.
      const weights = GOAL_WEIGHTS[goal];
      seq[i] = PILLARS.filter((p) => !isPromo(p)).reduce((a, b) => (weights[b] > weights[a] ? b : a));
    }
  }
  return seq;
}
