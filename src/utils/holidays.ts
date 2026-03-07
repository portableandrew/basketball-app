// Holiday detection and schedule utilities

import { SCHOOL_HOLIDAY_RANGES } from "../models/constants";

/**
 * Check if a date falls within school holiday ranges
 */
export function isSchoolHoliday(dateString: string): boolean {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  for (const range of SCHOOL_HOLIDAY_RANGES) {
    const { start, end } = range;

    // Handle year-spanning ranges (e.g., Dec 6 - Jan 31)
    if (start.month > end.month) {
      // Range spans across year boundary (Dec to Jan)
      if (
        (month === start.month && day >= start.day) || // Dec 6-31
        (month === end.month && day <= end.day) || // Jan 1-31
        (month > start.month) || // Any month after Dec (shouldn't happen, but safety)
        (month < end.month) // Any month before Jan (shouldn't happen, but safety)
      ) {
        return true;
      }
    } else {
      // Normal range within same year
      if (
        (month === start.month && day >= start.day) ||
        (month === end.month && day <= end.day) ||
        (month > start.month && month < end.month)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the day type for a given date
 */
export function getDayType(
  dateString: string,
  isFamilyHoliday: boolean,
  isRestDay: boolean
): "school" | "school_holiday" | "family_holiday" | "rest" {
  if (isRestDay) return "rest";
  if (isFamilyHoliday) return "family_holiday";
  if (isSchoolHoliday(dateString)) return "school_holiday";
  return "school";
}

/**
 * Format schedule label for display
 */
export function getScheduleLabel(
  dayType: "school" | "school_holiday" | "family_holiday" | "rest",
  familyHolidaySchedule?: "no_scheduled" | "custom",
  customSlots?: { startTime: string; endTime: string }[]
): string {
  switch (dayType) {
    case "school":
      return "School day – 6–7:40am & 4–6:30pm sessions";
    case "school_holiday":
      return "School holiday – 7–10am & 2–5pm sessions";
    case "family_holiday":
      if (familyHolidaySchedule === "no_scheduled") {
        return "Family holiday – no scheduled sessions (optional light work)";
      } else if (customSlots && customSlots.length > 0) {
        const slots = customSlots
          .map((s) => `${s.startTime}–${s.endTime}`)
          .join(" & ");
        return `Family holiday – ${slots} sessions`;
      }
      return "Family holiday – no scheduled sessions";
    case "rest":
      return "Rest day";
    default:
      return "Normal day";
  }
}
