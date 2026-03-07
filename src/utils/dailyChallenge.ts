// Daily Challenge – one challenge per day, bonus XP/VC on completion

export interface DailyChallengeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons
  xpBonus: number;
  vcBonus: number;
}

export const DAILY_CHALLENGES: DailyChallengeDef[] = [
  {
    id: "complete_any_workout",
    name: "Get After It",
    description: "Complete any NBA workout today",
    icon: "basketball",
    xpBonus: 25,
    vcBonus: 15,
  },
  {
    id: "log_20_free_throws",
    name: "Free Throw Focus",
    description: "Log 20+ free throws today",
    icon: "ellipse-outline",
    xpBonus: 25,
    vcBonus: 15,
  },
  {
    id: "form_shooting",
    name: "Form Check",
    description: "Complete Form Shooting Fundamentals today",
    icon: "fitness",
    xpBonus: 30,
    vcBonus: 20,
  },
  {
    id: "log_50_makes",
    name: "Bucket Getter",
    description: "Log 50+ makes in one day",
    icon: "flash",
    xpBonus: 30,
    vcBonus: 20,
  },
  {
    id: "complete_2_drills",
    name: "Double Down",
    description: "Complete 2+ drills today",
    icon: "layers",
    xpBonus: 25,
    vcBonus: 15,
  },
  {
    id: "log_any_session",
    name: "Show Up",
    description: "Log any practice session today",
    icon: "checkmark-circle",
    xpBonus: 20,
    vcBonus: 10,
  },
];

/** Deterministic challenge for a date (same date = same challenge) */
function hashDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h << 5) - h + dateStr.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTodaysChallenge(dateStr: string): DailyChallengeDef {
  const index = hashDate(dateStr) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

export interface DailyChallengeCheckData {
  date: string;
  practiceDays: { date: string; sessions: any[]; freeThrows?: { makes: number; attempts: number } }[];
  drillCompletions: { date: string; drillId: string; completed: boolean }[];
  shootingSets: { date: string; makes: number; attempts: number }[];
}

/** Returns true if today's challenge is complete given current data */
export function checkDailyChallengeComplete(
  challengeId: string,
  data: DailyChallengeCheckData
): boolean {
  const today = data.date;
  const daySessions = data.practiceDays.find((d) => d.date === today);
  const dayDrillCompletions = data.drillCompletions.filter((dc) => dc.date === today && dc.completed);
  const dayShootingSets = data.shootingSets.filter((s) => s.date === today);
  const dayFreeThrows = daySessions?.freeThrows;

  switch (challengeId) {
    case "complete_any_workout":
      return dayDrillCompletions.some((dc) =>
        ["perimeter_1", "perimeter_2", "perimeter_3", "perimeter_4", "perimeter_5", "finishing_1", "finishing_2", "finishing_3", "finishing_4", "handle_1", "handle_2", "handle_3", "handle_4"].includes(dc.drillId)
      );
    case "log_20_free_throws":
      return (dayFreeThrows?.attempts ?? 0) >= 20;
    case "form_shooting":
      return dayDrillCompletions.some((dc) => dc.drillId === "perimeter_5");
    case "log_50_makes": {
      const totalMakes = dayShootingSets.reduce((s, set) => s + (set.makes || 0), 0);
      const ftMakes = dayFreeThrows?.makes ?? 0;
      return totalMakes + ftMakes >= 50;
    }
    case "complete_2_drills":
      return dayDrillCompletions.length >= 2;
    case "log_any_session":
      return (daySessions?.sessions?.length ?? 0) > 0;
    default:
      return false;
  }
}

