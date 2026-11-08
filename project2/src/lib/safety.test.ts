import { describe, expect, it } from "vitest";
import { shouldAutoWater, validateAction } from "./safety";

const ctx = {
  hasDevice: true,
  moistureMax: 70,
  latest: { soil_moisture: 40, tank_level: 60, ageMinutes: 5 },
};

describe("hardware safety", () => {
  it("rejects actions when no hardware is connected", () => {
    expect(
      validateAction({ type: "pause_watering", hours: 24 }, { ...ctx, hasDevice: false }).ok,
    ).toBe(false);
  });
  it("rejects watering when soil is already at the plant's max moisture", () => {
    expect(
      validateAction(
        { type: "water_now", amount_ml: 200 },
        { ...ctx, latest: { ...ctx.latest, soil_moisture: 92 } },
      ).ok,
    ).toBe(false);
  });
  it("rejects watering with outdated readings", () => {
    expect(
      validateAction(
        { type: "water_now", amount_ml: 200 },
        { ...ctx, latest: { ...ctx.latest, ageMinutes: 500 } },
      ).ok,
    ).toBe(false);
  });
  it("rejects watering amounts above 400 ml", () => {
    expect(validateAction({ type: "water_now", amount_ml: 1000 }, ctx).ok).toBe(false);
  });
  it("requires approval for a valid watering", () => {
    const v = validateAction({ type: "water_now", amount_ml: 200 }, ctx);
    expect(v.ok && v.requiresApproval).toBe(true);
  });
  it("auto-waters below threshold without approval, but not while paused", () => {
    const base = {
      auto_watering: true,
      watering_threshold: 35,
      paused_until: null,
      moisture: 30,
      tank: 50,
    };
    expect(shouldAutoWater(base)).toBe(true);
    expect(
      shouldAutoWater({ ...base, paused_until: new Date(Date.now() + 3600e3).toISOString() }),
    ).toBe(false);
  });
});
