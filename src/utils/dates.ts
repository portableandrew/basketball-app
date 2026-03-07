// Date utility functions with Victoria, Australia timezone support
// All functions use Intl.DateTimeFormat to avoid RangeError from toISOString()

/**
 * Check if a Date object is valid
 */
function isValidDate(d: any): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Format a date to YYYY-MM-DD string in Victoria, Australia timezone
 * Uses Intl.DateTimeFormat - never uses toISOString()
 * Returns stable local date key: "YYYY-MM-DD"
 */
export function formatVictoriaDateKey(date?: Date): string {
  try {
    // If no date provided or invalid, use current date
    const d = date && isValidDate(date) ? date : new Date();
    
    // Validate the date is still valid
    if (!isValidDate(d)) {
      // Ultimate fallback: create fresh date
      return formatVictoriaDateKey(new Date());
    }

    // Use Intl.DateTimeFormat with en-CA locale (which gives YYYY-MM-DD format)
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Format the date
    const formatted = formatter.format(d);
    
    // en-CA format should already be YYYY-MM-DD, but validate
    if (formatted && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
      return formatted;
    }

    // Fallback: use formatToParts
    try {
      const parts = formatter.formatToParts(d);
      const year = parts.find((p) => p.type === "year")?.value || "";
      const month = parts.find((p) => p.type === "month")?.value || "";
      const day = parts.find((p) => p.type === "day")?.value || "";

      if (year && month && day) {
        return `${year}-${month}-${day}`;
      }
    } catch (partsError) {
      // formatToParts failed, continue to manual fallback
    }

    // Last resort: manual UTC formatting (not ideal but safe)
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error in formatVictoriaDateKey:", error);
    // Ultimate fallback: create fresh date and try again
    try {
      const fallback = new Date();
      if (isValidDate(fallback)) {
        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Australia/Melbourne",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const formatted = formatter.format(fallback);
        if (formatted && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
          return formatted;
        }
      }
    } catch (fallbackError) {
      // Even fallback failed
    }
    
    // Last resort: manual format from current UTC date
    const d = new Date();
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Get today's date as YYYY-MM-DD string in Victoria, Australia timezone
 * Simply calls formatVictoriaDateKey(new Date())
 */
export function getTodayDateString(): string {
  return formatVictoriaDateKey(new Date());
}

/**
 * Safely format a Date to YYYY-MM-DD string without using toISOString()
 * This prevents RangeError when dates are out of bounds
 * Uses Victoria timezone
 */
export function safeFormatDateToYYYYMMDD(date: Date): string {
  return formatVictoriaDateKey(date);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    if (!dateString || typeof dateString !== "string") {
      return "Invalid date";
    }
    // Parse YYYY-MM-DD format
    const date = new Date(dateString + "T00:00:00");
    if (!isValidDate(date)) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error in formatDate:", error);
    return "Invalid date";
  }
}

/**
 * Format date for calendar display
 */
export function formatDateShort(dateString: string): string {
  try {
    if (!dateString || typeof dateString !== "string") {
      return "";
    }
    const date = new Date(dateString + "T00:00:00");
    if (!isValidDate(date)) {
      return "";
    }
    return date.getDate().toString();
  } catch (error) {
    console.error("Error in formatDateShort:", error);
    return "";
  }
}

/**
 * Get date string for a given number of days ago (in Victoria timezone)
 */
export function getDateDaysAgo(days: number): string {
  try {
    if (!isFinite(days) || days < 0) {
      days = 0;
    }

    const now = new Date();
    if (!isValidDate(now)) {
      return getTodayDateString();
    }

    // Calculate the date N days ago
    const targetDate = new Date(now);
    targetDate.setUTCDate(targetDate.getUTCDate() - days);

    // Validate the result
    if (!isValidDate(targetDate)) {
      return getTodayDateString();
    }

    // Format in Victoria timezone
    return formatVictoriaDateKey(targetDate);
  } catch (error) {
    console.error("Error in getDateDaysAgo:", error);
    return getTodayDateString();
  }
}

/**
 * Get date string for a specific date in Victoria timezone
 */
export function getVictoriaDateString(date: Date): string {
  return formatVictoriaDateKey(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  try {
    if (!date1 || !date2) return false;
    return date1.split("T")[0] === date2.split("T")[0];
  } catch {
    return false;
  }
}

/**
 * Get all dates in a month
 */
export function getDatesInMonth(year: number, month: number): Date[] {
  try {
    const dates: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    if (!isValidDate(firstDay) || !isValidDate(lastDay)) {
      return [];
    }

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      if (isValidDate(d)) {
        dates.push(new Date(d));
      }
    }

    return dates;
  } catch (error) {
    console.error("Error in getDatesInMonth:", error);
    return [];
  }
}

/**
 * Get start and end of week for a given date
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  try {
    if (!isValidDate(date)) {
      const now = new Date();
      date = now;
    }
    const day = date.getDay();
    const diff = date.getDate() - day;
    const start = new Date(date);
    start.setDate(diff);
    const end = new Date(date);
    end.setDate(diff + 6);
    
    if (!isValidDate(start) || !isValidDate(end)) {
      const now = new Date();
      return { start: now, end: now };
    }
    
    return { start, end };
  } catch (error) {
    console.error("Error in getWeekBounds:", error);
    const now = new Date();
    return { start: now, end: now };
  }
}

/**
 * Get date string for N days before a given date string
 */
export function getDateBefore(dateString: string, days: number): string {
  try {
    if (!dateString || typeof dateString !== "string") {
      return getTodayDateString();
    }
    if (!isFinite(days) || days < 0) {
      days = 0;
    }

    // Parse the date string (expects YYYY-MM-DD format)
    const date = new Date(dateString + "T00:00:00");
    if (!isValidDate(date)) {
      return getTodayDateString();
    }

    // Subtract days
    date.setUTCDate(date.getUTCDate() - days);

    // Validate result
    if (!isValidDate(date)) {
      return getTodayDateString();
    }

    // Format safely using Victoria timezone
    return formatVictoriaDateKey(date);
  } catch (error) {
    console.error("Error in getDateBefore:", error);
    return getTodayDateString();
  }
}

/**
 * Get all date strings in a range (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  try {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    if (!isValidDate(start) || !isValidDate(end)) {
      return [];
    }

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      if (!isValidDate(d)) {
        break;
      }
      dates.push(formatVictoriaDateKey(d));
    }
  } catch (error) {
    console.error("Error in getDateRange:", error);
  }

  return dates;
}
