// Number utility functions for safe numeric operations

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Calculate safe percentage (0-100) from makes and attempts
 * Handles edge cases: negative values, makes > attempts, zero attempts
 */
export function safePercent(makes: number, attempts: number): number {
  // Ensure makes and attempts are valid numbers
  const safeMakes = isFinite(makes) ? Math.max(0, makes) : 0;
  const safeAttempts = isFinite(attempts) ? Math.max(0, attempts) : 0;

  // Clamp makes to not exceed attempts
  const clampedMakes = safeMakes > safeAttempts ? safeAttempts : safeMakes;

  // Calculate percentage
  if (safeAttempts <= 0) {
    return 0;
  }

  const percent = (clampedMakes / safeAttempts) * 100;
  return clamp(percent, 0, 100);
}

/**
 * Calculate safe ratio (0-1) from numerator and denominator
 */
export function safeRatio(numerator: number, denominator: number): number {
  const safeNum = isFinite(numerator) ? Math.max(0, numerator) : 0;
  const safeDen = isFinite(denominator) ? Math.max(0, denominator) : 0;

  if (safeDen <= 0) {
    return 0;
  }

  const ratio = safeNum / safeDen;
  return clamp(ratio, 0, 1);
}

/**
 * Format a number for display, handling NaN/Infinity
 */
export function formatNumber(value: number, decimals: number = 1): string {
  if (!isFinite(value)) {
    return "—";
  }
  return value.toFixed(decimals);
}

/**
 * Format a percentage for display, handling NaN/Infinity
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (!isFinite(value)) {
    return "—";
  }
  const clamped = clamp(value, 0, 100);
  return `${clamped.toFixed(decimals)}%`;
}
