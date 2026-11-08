// Safety layer between AI recommendations and hardware. Pure functions so they can be tested.

export type ActionType =
  | "water_now"
  | "pause_watering"
  | "resume_watering"
  | "set_threshold"
  | "enable_auto_watering"
  | "disable_auto_watering";

export const ACTION_LABELS: Record<ActionType, string> = {
  water_now: "Water now",
  pause_watering: "Pause automatic watering",
  resume_watering: "Resume automatic watering",
  set_threshold: "Change watering threshold",
  enable_auto_watering: "Turn on automatic watering",
  disable_auto_watering: "Turn off automatic watering",
};

export const LIMITS = {
  waterMinMl: 50,
  waterMaxMl: 400,
  pauseMinHours: 1,
  pauseMaxHours: 168,
  thresholdMin: 15,
  thresholdMax: 75,
  minTankLevel: 10,
  staleMinutes: 120,
};

export type ActionParams = { amount_ml?: number; hours?: number; threshold?: number };

export interface ProposedAction {
  type: ActionType;
  amount_ml?: number | null;
  hours?: number | null;
  threshold?: number | null;
}

export interface SafetyContext {
  hasDevice: boolean;
  moistureMax: number;
  latest: { soil_moisture: number | null; tank_level: number | null; ageMinutes: number } | null;
}

export type Validation =
  | { ok: true; requiresApproval: boolean; params: ActionParams; note: string }
  | { ok: false; note: string };

export function validateAction(a: ProposedAction, ctx: SafetyContext): Validation {
  if (!ctx.hasDevice)
    return { ok: false, note: "No Smart Plant device is connected to this plant." };
  switch (a.type) {
    case "water_now": {
      const ml = Math.round(a.amount_ml ?? 200);
      if (ml < LIMITS.waterMinMl || ml > LIMITS.waterMaxMl)
        return {
          ok: false,
          note: `Water amount must be between ${LIMITS.waterMinMl} and ${LIMITS.waterMaxMl} ml.`,
        };
      if (!ctx.latest || ctx.latest.ageMinutes > LIMITS.staleMinutes)
        return {
          ok: false,
          note: "Current sensor readings are missing or outdated, so watering can't be verified as safe.",
        };
      if (ctx.latest.soil_moisture != null && ctx.latest.soil_moisture >= ctx.moistureMax)
        return {
          ok: false,
          note: `Soil moisture is already ${ctx.latest.soil_moisture}% (limit ${ctx.moistureMax}%).`,
        };
      if (ctx.latest.tank_level != null && ctx.latest.tank_level < LIMITS.minTankLevel)
        return { ok: false, note: "Water tank is too low to run the pump." };
      return {
        ok: true,
        requiresApproval: true,
        params: { amount_ml: ml },
        note: "Within safe watering limits.",
      };
    }
    case "pause_watering": {
      const h = Math.round(a.hours ?? 24);
      if (h < LIMITS.pauseMinHours || h > LIMITS.pauseMaxHours)
        return {
          ok: false,
          note: `Pause must be between ${LIMITS.pauseMinHours} and ${LIMITS.pauseMaxHours} hours.`,
        };
      return {
        ok: true,
        requiresApproval: true,
        params: { hours: h },
        note: "Pausing is a safe action.",
      };
    }
    case "set_threshold": {
      const t = Math.round(a.threshold ?? NaN);
      if (!Number.isFinite(t) || t < LIMITS.thresholdMin || t > LIMITS.thresholdMax)
        return {
          ok: false,
          note: `Threshold must be between ${LIMITS.thresholdMin}% and ${LIMITS.thresholdMax}%.`,
        };
      if (t >= ctx.moistureMax)
        return {
          ok: false,
          note: `Threshold must stay below this plant's maximum moisture (${ctx.moistureMax}%).`,
        };
      return {
        ok: true,
        requiresApproval: true,
        params: { threshold: t },
        note: "Within safe threshold range.",
      };
    }
    case "resume_watering":
    case "enable_auto_watering":
    case "disable_auto_watering":
      return { ok: true, requiresApproval: true, params: {}, note: "Safe configuration change." };
    default:
      return { ok: false, note: "Unknown action." };
  }
}

// Plant-specific automatic watering rule: runs without approval.
export function shouldAutoWater(p: {
  auto_watering: boolean;
  watering_threshold: number;
  paused_until: string | null;
  moisture: number | null;
  tank: number | null;
  now?: Date;
}): boolean {
  const now = p.now ?? new Date();
  if (!p.auto_watering) return false;
  if (p.paused_until && new Date(p.paused_until) > now) return false;
  if (p.moisture == null || p.tank == null) return false;
  if (p.tank < LIMITS.minTankLevel) return false;
  return p.moisture < p.watering_threshold;
}
