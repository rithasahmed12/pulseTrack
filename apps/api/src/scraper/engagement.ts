/**
 * Engagement rate = ((likes + comments + (shares ?? 0)) / followers) * 100.
 * Returns 0 when followers is 0 or unknown to avoid division by zero / NaN.
 * Rounded to two decimals to match the numeric(5,2) DB column.
 */
export function computeEngagementRate(
  likes: number,
  comments: number,
  shares: number | null,
  followers: number,
): number {
  if (!followers || followers <= 0) return 0;
  const interactions = likes + comments + (shares ?? 0);
  const rate = (interactions / followers) * 100;
  return Math.round(rate * 100) / 100;
}

export function meanEngagementRate(rates: number[]): number {
  if (rates.length === 0) return 0;
  const sum = rates.reduce((a, b) => a + b, 0);
  return Math.round((sum / rates.length) * 100) / 100;
}
