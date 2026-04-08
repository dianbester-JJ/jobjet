export type RateType = "per_hour" | "per_day" | "custom";

export const COMMON_CUSTOM_UNITS = [
  "per sqm",
  "per wash",
  "per walk",
  "per tree",
  "per room",
  "per load",
  "per window",
  "per session",
  "per trip",
  "per item",
] as const;

export function formatRate(
  rate: number,
  rateType?: string | null,
  rateUnit?: string | null,
  workingHoursPerDay?: number | null
): { amount: string; label: string; subtitle?: string } {
  const amount = `R${rate}`;

  if (rateType === "per_day") {
    return {
      amount,
      label: "/day",
      subtitle: workingHoursPerDay ? `${workingHoursPerDay} working hours` : undefined,
    };
  }

  if (rateType === "custom" && rateUnit) {
    return { amount, label: `/${rateUnit.replace(/^per\s*/i, "")}` };
  }

  return { amount, label: "/hour" };
}
