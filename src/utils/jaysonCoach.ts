import { PracticeDay, ShootingSet, ShotSpot } from "../models/types";
import { getDateDaysAgo } from "./dates";
import { safePercent } from "./number";

export type CoachInsightPriority = "high" | "medium" | "positive";

export interface CoachInsight {
  id: string;
  title: string;
  body: string;
  priority: CoachInsightPriority;
}

export interface SpotPerformance {
  spotId: string;
  spotName: string;
  makes: number;
  attempts: number;
  percentage: number;
}

export interface CoachSnapshot {
  totalMakes: number;
  totalAttempts: number;
  overallFg: number;
  last7Fg: number;
  last14Fg: number;
  trendDelta: number;
  streakDays: number;
  totalPracticeDays: number;
  strongestSpot?: SpotPerformance;
  weakestSpot?: SpotPerformance;
}

function sumSets(sets: ShootingSet[]): { makes: number; attempts: number; fg: number } {
  const makes = sets.reduce((sum, set) => sum + Math.max(0, set.makes || 0), 0);
  const attempts = sets.reduce((sum, set) => sum + Math.max(0, set.attempts || 0), 0);
  const fg = safePercent(makes, attempts);
  return { makes, attempts, fg };
}

function getConsecutivePracticeDays(days: PracticeDay[]): number {
  if (days.length === 0) return 0;

  const activeDates = days
    .filter((day) => !day.isRestDay && (day.sessions.length > 0 || day.freeThrows?.attempts))
    .map((day) => day.date)
    .sort((a, b) => (a < b ? 1 : -1));

  if (activeDates.length === 0) return 0;

  let streak = 1;
  let cursor = new Date(`${activeDates[0]}T00:00:00`);

  for (let i = 1; i < activeDates.length; i++) {
    const next = new Date(`${activeDates[i]}T00:00:00`);
    const diffMs = cursor.getTime() - next.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
      cursor = next;
    } else {
      break;
    }
  }

  return streak;
}

export function buildCoachAnalysis(
  allSets: ShootingSet[],
  allSpots: ShotSpot[],
  practiceDays: PracticeDay[]
): { snapshot: CoachSnapshot; insights: CoachInsight[] } {
  const activeSpots = allSpots.filter((spot) => spot.isActive);

  const allTotals = sumSets(allSets);
  const sets7 = allSets.filter((set) => set.date >= getDateDaysAgo(7));
  const sets14 = allSets.filter((set) => set.date >= getDateDaysAgo(14));
  const totals7 = sumSets(sets7);
  const totals14 = sumSets(sets14);

  const spotPerformance: SpotPerformance[] = activeSpots.map((spot) => {
    const spotSets = allSets.filter((set) => set.spotId === spot.id);
    const totals = sumSets(spotSets);
    return {
      spotId: spot.id,
      spotName: spot.name,
      makes: totals.makes,
      attempts: totals.attempts,
      percentage: totals.fg,
    };
  });

  const rankedSpots = spotPerformance
    .filter((spot) => spot.attempts >= 20)
    .sort((a, b) => b.percentage - a.percentage);

  const strongestSpot = rankedSpots[0];
  const weakestSpot = rankedSpots[rankedSpots.length - 1];
  const streakDays = getConsecutivePracticeDays(practiceDays);

  const snapshot: CoachSnapshot = {
    totalMakes: allTotals.makes,
    totalAttempts: allTotals.attempts,
    overallFg: allTotals.fg,
    last7Fg: totals7.fg,
    last14Fg: totals14.fg,
    trendDelta: totals7.fg - totals14.fg,
    streakDays,
    totalPracticeDays: practiceDays.length,
    strongestSpot,
    weakestSpot,
  };

  const insights: CoachInsight[] = [];

  if (allTotals.attempts < 60) {
    insights.push({
      id: "sample_size",
      title: "Need More Volume",
      body: "Get at least 60 more tracked shots before making major form changes.",
      priority: "medium",
    });
  }

  if (snapshot.weakestSpot && snapshot.weakestSpot.percentage < 45) {
    insights.push({
      id: "weakest_spot",
      title: "Main Weak Spot",
      body: `${snapshot.weakestSpot.spotName} is your lowest percentage zone. Start each session with 3 focused rounds there.`,
      priority: "high",
    });
  }

  const cornerShots = spotPerformance.filter((spot) => spot.spotName.toLowerCase().includes("corner"));
  const cornerTotals = cornerShots.reduce(
    (acc, spot) => {
      acc.makes += spot.makes;
      acc.attempts += spot.attempts;
      return acc;
    },
    { makes: 0, attempts: 0 }
  );
  const cornerFg = safePercent(cornerTotals.makes, cornerTotals.attempts);

  if (cornerTotals.attempts >= 20 && cornerFg < 48) {
    insights.push({
      id: "corner_three",
      title: "Corner 3 Priority",
      body: "Corner efficiency is below target. Add 50 corner catch-and-shoot reps in each workout.",
      priority: "high",
    });
  }

  if (snapshot.trendDelta >= 4) {
    insights.push({
      id: "trend_up",
      title: "Trending Up",
      body: "Last 7 days are outperforming your 14-day average. Keep the same pre-shot routine.",
      priority: "positive",
    });
  } else if (snapshot.trendDelta <= -4) {
    insights.push({
      id: "trend_down",
      title: "Short-Term Dip",
      body: "Last 7 days dropped against your 14-day baseline. Cut workout pace slightly and reset mechanics.",
      priority: "medium",
    });
  }

  if (snapshot.streakDays >= 5) {
    insights.push({
      id: "consistency",
      title: "Consistency Win",
      body: `You're on a ${snapshot.streakDays}-day streak. Consistency is driving development right now.`,
      priority: "positive",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "balanced",
      title: "Solid Balance",
      body: "No major red flags right now. Focus on maintaining shot quality while adding volume.",
      priority: "positive",
    });
  }

  return { snapshot, insights };
}

export function answerCoachQuestion(question: string, snapshot: CoachSnapshot, insights: CoachInsight[]): string {
  const lower = question.toLowerCase();

  if (lower.includes("focus")) {
    const keyIssue = insights.find((item) => item.priority === "high") || insights[0];
    return keyIssue
      ? `${keyIssue.title}: ${keyIssue.body}`
      : "Focus on quality reps from your weakest spot, then finish with game-speed makes.";
  }

  if (lower.includes("weak")) {
    if (!snapshot.weakestSpot) {
      return "Not enough attempts per spot yet. Keep tracking to identify your weakest area with confidence.";
    }
    return `${snapshot.weakestSpot.spotName} is your weakest zone at ${snapshot.weakestSpot.percentage.toFixed(1)}%. Make this your first block each workout.`;
  }

  if (lower.includes("improving") || lower.includes("trend")) {
    if (snapshot.trendDelta >= 1) {
      return `Yes, you are improving. Your 7-day FG (${snapshot.last7Fg.toFixed(1)}%) is up ${snapshot.trendDelta.toFixed(1)} points over 14-day FG.`;
    }
    if (snapshot.trendDelta <= -1) {
      return `You're in a small dip. Your 7-day FG (${snapshot.last7Fg.toFixed(1)}%) is ${Math.abs(snapshot.trendDelta).toFixed(1)} points below 14-day FG.`;
    }
    return "You're stable right now. Focus on adding high-quality reps to push the trend upward.";
  }

  if (lower.includes("30") || lower.includes("workout")) {
    return "30-min plan: 10 min form shooting (close range), 10 min weakest spot game-speed reps, 10 min corner 3 catch-and-shoot under light fatigue.";
  }

  if (lower.includes("corner")) {
    return "For corner 3s: lock feet early, dip the ball less, and keep reps short and sharp (5 sets x 10 makes each corner).";
  }

  return `Current snapshot: ${snapshot.overallFg.toFixed(1)}% overall on ${snapshot.totalAttempts} attempts. Ask about focus, weakness, trend, or a workout plan.`;
}
