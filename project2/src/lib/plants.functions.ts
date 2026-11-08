import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  LIMITS,
  shouldAutoWater,
  validateAction,
  type ActionParams,
  type ActionType,
} from "./safety";

type Sb = SupabaseClient<Database>;

// ---------- Hardware communication layer (simulated device driver) ----------
// A real Wi-Fi/Bluetooth device would POST readings to a backend endpoint instead.
async function pollDevice(sb: Sb, plantId: string) {
  const { data: device } = await sb
    .from("devices")
    .select("*")
    .eq("plant_id", plantId)
    .maybeSingle();
  if (!device || device.connection !== "simulated") return;
  const { data: last } = await sb
    .from("sensor_readings")
    .select("*")
    .eq("plant_id", plantId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last && Date.now() - new Date(last.recorded_at).getTime() < 10 * 60 * 1000) return;
  const { data: plant } = await sb.from("plants").select("*").eq("id", plantId).single();
  if (!plant) return;
  const n = (v: unknown, d: number) => (v == null ? d : Number(v));
  const hour = new Date().getHours();
  let moisture = Math.max(0, n(last?.soil_moisture, 55) - 0.4 + (Math.random() - 0.5));
  const tank = Math.max(0, n(last?.tank_level, 70) - 0.1);
  const reading = {
    device_id: device.id,
    plant_id: plantId,
    soil_moisture: +moisture.toFixed(1),
    humidity: +(58 + Math.random() * 8).toFixed(1),
    temperature: +(21 + Math.random() * 3).toFixed(1),
    light: +Math.max(0, 70 * Math.sin(((hour - 6) / 12) * Math.PI) + Math.random() * 5).toFixed(1),
    tank_level: +tank.toFixed(1),
  };
  await sb.from("sensor_readings").insert(reading);
  await sb
    .from("devices")
    .update({ last_seen_at: new Date().toISOString(), status: "online" })
    .eq("id", device.id);

  // Plant-specific automation rule (no approval needed).
  if (
    shouldAutoWater({
      auto_watering: plant.auto_watering,
      watering_threshold: plant.watering_threshold,
      paused_until: plant.watering_paused_until,
      moisture,
      tank,
    })
  ) {
    await sb.from("watering_events").insert({ plant_id: plantId, source: "auto", amount_ml: 200 });
    moisture = Math.min(95, moisture + 25);
    await sb.from("sensor_readings").insert({
      ...reading,
      soil_moisture: +moisture.toFixed(1),
      tank_level: +(tank - 2).toFixed(1),
    });
    await sb.from("plants").update({ last_watered_at: new Date().toISOString() }).eq("id", plantId);
  }
  // Environmental alerts
  const alerts: string[] = [];
  if (reading.tank_level < 15) alerts.push("Water tank is running low — refill soon.");
  if (moisture > plant.moisture_max + 15)
    alerts.push(`Soil moisture is very high (${moisture.toFixed(0)}%).`);
  if (moisture < plant.moisture_min - 15)
    alerts.push(`Soil is very dry (${moisture.toFixed(0)}%).`);
  for (const message of alerts)
    await sb.from("alerts").insert({ plant_id: plantId, message, severity: "warning" });
}

export const refreshDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { plantId: string }) => d)
  .handler(async ({ data, context }) => {
    await pollDevice(context.supabase, data.plantId);
    return { ok: true };
  });

// ---------- Plants ----------
export const createPlant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      name: string;
      species: string;
      location?: string;
      withDevice: boolean;
      demo?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: plant, error } = await sb
      .from("plants")
      .insert({
        name: data.name.slice(0, 80),
        species: data.species.slice(0, 80) || "Unknown",
        location: data.location?.slice(0, 80) ?? null,
        ...(data.demo
          ? {
              moisture_min: 40,
              moisture_max: 65,
              humidity_min: 50,
              humidity_max: 75,
              temp_min: 18,
              temp_max: 27,
            }
          : {}),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data.withDevice) {
      const { data: device, error: dErr } = await sb
        .from("devices")
        .insert({ plant_id: plant.id })
        .select()
        .single();
      if (dErr) throw new Error(dErr.message);
      const { error: sErr } = await sb.rpc("simulate_device_history", {
        _device: device.id,
        _scenario: data.demo ? "overwatered" : "normal",
      });
      if (sErr) throw new Error(sErr.message);
      if (data.demo) {
        await sb.from("alerts").insert({
          plant_id: plant.id,
          message: "Soil moisture has stayed above 85% for 2 days.",
          severity: "warning",
        });
        await sb.from("health_assessments").insert({
          plant_id: plant.id,
          status: "watch",
          summary: "Two lower leaves showed slight yellowing last week.",
        });
      }
    }
    return { id: plant.id };
  });

// ---------- Actions: approve / reject and send to hardware ----------
async function executeOnDevice(sb: Sb, plantId: string, type: ActionType, params: ActionParams) {
  const now = new Date();
  switch (type) {
    case "water_now":
      await sb
        .from("watering_events")
        .insert({ plant_id: plantId, source: "ai", amount_ml: params.amount_ml ?? 200 });
      await sb.from("plants").update({ last_watered_at: now.toISOString() }).eq("id", plantId);
      return `Pump ran and delivered ${params.amount_ml} ml.`;
    case "pause_watering": {
      const until = new Date(now.getTime() + (params.hours ?? 24) * 3600e3);
      await sb
        .from("plants")
        .update({ watering_paused_until: until.toISOString() })
        .eq("id", plantId);
      return `Automatic watering paused until ${until.toUTCString()}.`;
    }
    case "resume_watering":
      await sb.from("plants").update({ watering_paused_until: null }).eq("id", plantId);
      return "Automatic watering resumed.";
    case "set_threshold":
      await sb
        .from("plants")
        .update({ watering_threshold: params.threshold ?? 35 })
        .eq("id", plantId);
      return `Device will now water below ${params.threshold}% soil moisture.`;
    case "enable_auto_watering":
      await sb.from("plants").update({ auto_watering: true }).eq("id", plantId);
      return "Automatic watering turned on.";
    case "disable_auto_watering":
      await sb.from("plants").update({ auto_watering: false }).eq("id", plantId);
      return "Automatic watering turned off.";
  }
}

export const resolveAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { actionId: string; approve: boolean }) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: action } = await sb
      .from("device_actions")
      .select("*")
      .eq("id", data.actionId)
      .single();
    if (!action || action.status !== "pending")
      throw new Error("This action is no longer pending.");
    if (!data.approve) {
      await sb
        .from("device_actions")
        .update({ status: "rejected", resolved_at: new Date().toISOString() })
        .eq("id", action.id);
      return { status: "rejected" };
    }
    // Re-validate at execution time against fresh readings.
    await pollDevice(sb, action.plant_id);
    const ctx = await safetyContext(sb, action.plant_id);
    const v = validateAction(
      { type: action.action_type as ActionType, ...(action.params as ActionParams) },
      ctx,
    );
    if (!v.ok) {
      await sb
        .from("device_actions")
        .update({ status: "failed", result_note: v.note, resolved_at: new Date().toISOString() })
        .eq("id", action.id);
      return { status: "failed", note: v.note };
    }
    const note = await executeOnDevice(
      sb,
      action.plant_id,
      action.action_type as ActionType,
      v.params,
    );
    await sb
      .from("device_actions")
      .update({
        status: "executed",
        result_note: `Device confirmed: ${note}`,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", action.id);
    return { status: "executed", note };
  });

async function safetyContext(sb: Sb, plantId: string) {
  const [{ data: plant }, { data: device }, { data: last }] = await Promise.all([
    sb.from("plants").select("moisture_max").eq("id", plantId).single(),
    sb.from("devices").select("id").eq("plant_id", plantId).maybeSingle(),
    sb
      .from("sensor_readings")
      .select("*")
      .eq("plant_id", plantId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    hasDevice: !!device,
    moistureMax: plant?.moisture_max ?? 70,
    latest: last
      ? {
          soil_moisture: last.soil_moisture,
          tank_level: last.tank_level,
          ageMinutes: (Date.now() - new Date(last.recorded_at).getTime()) / 60000,
        }
      : null,
  };
}

// ---------- AI context builder ----------
async function buildPlantContext(sb: Sb, plantId: string) {
  const { data: plant } = await sb.from("plants").select("*").eq("id", plantId).single();
  if (!plant) return { hasDevice: false, text: "No plant selected." };
  const { data: device } = await sb
    .from("devices")
    .select("*")
    .eq("plant_id", plantId)
    .maybeSingle();
  const since7d = new Date(Date.now() - 7 * 86400e3).toISOString();
  const [{ data: assessments }, { data: alerts }, { data: actions }] = await Promise.all([
    sb
      .from("health_assessments")
      .select("created_at,status,summary")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(5),
    sb
      .from("alerts")
      .select("created_at,severity,message")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(5),
    sb
      .from("device_actions")
      .select("created_at,action_type,status,params")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const ctx: { hardware?: unknown; [k: string]: unknown } = {
    plant: {
      name: plant.name,
      species: plant.species,
      location: plant.location,
      optimal_conditions: {
        soil_moisture_pct: [plant.moisture_min, plant.moisture_max],
        air_humidity_pct: [plant.humidity_min, plant.humidity_max],
        temperature_c: [plant.temp_min, plant.temp_max],
        light_pct: [plant.light_min, plant.light_max],
      },
      watering_reminder_every_days: plant.reminder_every_days,
      last_watered_at: plant.last_watered_at,
    },
    previous_health_assessments: assessments ?? [],
    recent_alerts: alerts ?? [],
    recent_device_actions: actions ?? [],
  };
  if (!device) {
    ctx.hardware = {
      connected: false,
      note: "Standalone user. NO sensor data exists. Never invent readings.",
    };
    return { hasDevice: false, text: JSON.stringify(ctx, null, 1) };
  }
  const [{ data: readings }, { data: waterings }] = await Promise.all([
    sb
      .from("sensor_readings")
      .select("recorded_at,soil_moisture,humidity,temperature,light,tank_level")
      .eq("plant_id", plantId)
      .gte("recorded_at", since7d)
      .order("recorded_at", { ascending: true }),
    sb
      .from("watering_events")
      .select("occurred_at,source,amount_ml")
      .eq("plant_id", plantId)
      .gte("occurred_at", since7d)
      .order("occurred_at", { ascending: false }),
  ]);
  const rs = readings ?? [];
  const latest = rs.at(-1);
  const ageMin = latest
    ? Math.round((Date.now() - new Date(latest.recorded_at).getTime()) / 60000)
    : null;
  const stat = (k: "soil_moisture" | "humidity" | "temperature" | "light", hours: number) => {
    const cut = Date.now() - hours * 3600e3;
    const v = rs
      .filter((r) => new Date(r.recorded_at).getTime() >= cut)
      .map((r) => Number(r[k]))
      .filter((x) => Number.isFinite(x));
    if (!v.length) return null;
    return {
      min: Math.min(...v),
      max: Math.max(...v),
      avg: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1),
      samples: v.length,
    };
  };
  const w48 = (waterings ?? []).filter(
    (w) => Date.now() - new Date(w.occurred_at).getTime() < 48 * 3600e3,
  ).length;
  ctx.hardware = {
    connected: true,
    device_status: device.status,
    connection: device.connection,
    last_seen_at: device.last_seen_at,
    automation: {
      auto_watering: plant.auto_watering,
      watering_threshold_pct: plant.watering_threshold,
      paused_until: plant.watering_paused_until,
    },
    latest_reading: latest
      ? { ...latest, age_minutes: ageMin, is_outdated: (ageMin ?? 0) > LIMITS.staleMinutes }
      : "MISSING — no readings available",
    trends: {
      last_24h: {
        soil_moisture: stat("soil_moisture", 24),
        humidity: stat("humidity", 24),
        temperature: stat("temperature", 24),
        light: stat("light", 24),
      },
      last_7d: {
        soil_moisture: stat("soil_moisture", 168),
        temperature: stat("temperature", 168),
        light: stat("light", 168),
      },
    },
    watering: {
      events_last_48h: w48,
      events_last_7d: (waterings ?? []).length,
      recent: (waterings ?? []).slice(0, 8),
    },
    units: {
      soil_moisture: "%",
      humidity: "% RH",
      temperature: "°C",
      light: "% of full sun sensor scale",
      tank_level: "%",
    },
  };
  return { hasDevice: true, text: JSON.stringify(ctx, null, 1) };
}

const SYSTEM = `You are Fern, the AI Plant Assistant at the center of the Smart Plant ecosystem.
You combine (1) photo analysis, (2) the user's question and (3) structured, timestamped sensor data when a device is connected.
Rules:
- Ground every claim. Explicitly cite the observations (readings with values, trends, watering counts, photo features) that support your conclusions.
- Compare readings against the plant's optimal conditions and look at historical trends, not only the latest value.
- Communicate uncertainty honestly ("may", "likely", "I can't confirm without..."). Offer the most likely causes ranked.
- If hardware.connected is false: NEVER invent or imply sensor readings or hardware access. Use photo analysis and plant-care knowledge. You may suggest watering reminders.
- If the latest reading is missing or outdated, say clearly that you cannot access current measurements.
- You can only RECOMMEND hardware actions; they are validated by the backend and approved by the user. Never claim you executed anything.
- Allowed hardware actions: water_now (amount_ml 50-400), pause_watering (hours 1-168), resume_watering, set_threshold (threshold 15-75 %), enable_auto_watering, disable_auto_watering. Only propose them when a device is connected and they are clearly justified.
- You cannot change sunlight or temperature: give placement/environment advice instead.
- If a photo shows a plant, identify the species if possible and note visible symptoms or diseases.
- Write the reply in friendly, concise Markdown (short paragraphs, bullets ok). Reply in the user's language.
- Also return a short health assessment (status healthy|watch|concern|unknown).`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "assessment", "actions"],
  properties: {
    reply: { type: "string" },
    assessment: {
      type: "object",
      additionalProperties: false,
      required: ["status", "summary"],
      properties: {
        status: { type: "string", enum: ["healthy", "watch", "concern", "unknown"] },
        summary: { type: "string" },
      },
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "amount_ml", "hours", "threshold", "reason"],
        properties: {
          type: {
            type: "string",
            enum: [
              "water_now",
              "pause_watering",
              "resume_watering",
              "set_threshold",
              "enable_auto_watering",
              "disable_auto_watering",
            ],
          },
          amount_ml: { type: ["number", "null"] },
          hours: { type: ["number", "null"] },
          threshold: { type: ["number", "null"] },
          reason: { type: "string" },
        },
      },
    },
  },
} as const;

type AiOut = {
  reply: string;
  assessment: { status: string; summary: string };
  actions: {
    type: ActionType;
    amount_ml: number | null;
    hours: number | null;
    threshold: number | null;
    reason: string;
  }[];
};

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string; text: string; imageDataUrl?: string | null }) => {
    if (!d.text?.trim() && !d.imageDataUrl) throw new Error("Message is empty");
    if (d.imageDataUrl && d.imageDataUrl.length > 6_000_000) throw new Error("Image too large");
    return d;
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: thread, error: tErr } = await sb
      .from("chat_threads")
      .select("*")
      .eq("id", data.threadId)
      .single();
    if (tErr || !thread) throw new Error("Conversation not found");

    let imagePath: string | null = null;
    if (data.imageDataUrl) {
      const m = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(data.imageDataUrl);
      if (!m) throw new Error("Unsupported image");
      const bytes = Uint8Array.from(atob(m[3] ?? ""), (c) => c.charCodeAt(0));
      imagePath = `${context.userId}/${crypto.randomUUID()}.${m[2] === "jpeg" ? "jpg" : m[2]}`;
      const { error: upErr } = await sb.storage
        .from("plant-photos")
        .upload(imagePath, bytes, { contentType: m[1] });
      if (upErr) throw new Error(upErr.message);
    }

    // Poll hardware for fresh data before analysis
    let plantCtx = {
      hasDevice: false,
      text: "No specific plant selected. Give general plant-care advice; no sensor data is available.",
    };
    if (thread.plant_id) {
      await pollDevice(sb, thread.plant_id);
      plantCtx = await buildPlantContext(sb, thread.plant_id);
    }
    const mode = plantCtx.hasDevice ? "sensor" : "photo";

    const userText = data.text.trim() || "Please analyze this photo of my plant.";
    const { error: insErr } = await sb.from("chat_messages").insert({
      thread_id: thread.id,
      role: "user",
      content: userText,
      image_path: imagePath,
      context_mode: mode,
    });
    if (insErr) throw new Error(insErr.message);

    const { data: history } = await sb
      .from("chat_messages")
      .select("role,content")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true });
    const prior = (history ?? []).slice(0, -1).slice(-20);

    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const currentContent: (
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string; detail: "auto" }
    )[] = [
      {
        type: "input_text",
        text: `PLANT CONTEXT (JSON, generated ${new Date().toISOString()}):\n${plantCtx.text}\n\nUSER MESSAGE:\n${userText}\n\nReturn JSON.`,
      },
    ];
    if (data.imageDataUrl)
      currentContent.push({ type: "input_image", image_url: data.imageDataUrl, detail: "auto" });

    let out: AiOut;
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        input: [
          ...prior.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: currentContent },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "plant_assistant",
            strict: true,
            schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
          },
        },
      });
      const r = res as unknown as {
        output_text?: string;
        output?: { type: string; content?: { type: string; text?: string }[] }[];
      };
      const txt =
        r.output_text ??
        r.output
          ?.flatMap((o) => o.content ?? [])
          .filter((c) => c.type === "output_text")
          .map((c) => c.text)
          .join("") ??
        "";
      out = JSON.parse(txt) as AiOut;
    } catch (e) {
      console.error(e);
      const msg =
        e instanceof GatewayError && e.httpStatus === 402
          ? "The AI assistant is out of credits right now. Please try again later."
          : e instanceof GatewayError && e.httpStatus === 429
            ? "The assistant is busy right now. Please wait a moment and try again."
            : "Sorry — I couldn't analyze that right now. Please try again.";
      await sb
        .from("chat_messages")
        .insert({ thread_id: thread.id, role: "assistant", content: msg, context_mode: mode });
      return { ok: false };
    }

    // Validate proposed actions through the safety layer
    const proposed: string[] = [];
    if (thread.plant_id && out.actions.length) {
      const sctx = await safetyContext(sb, thread.plant_id);
      for (const a of out.actions.slice(0, 3)) {
        const v = validateAction(a, sctx);
        await sb.from("device_actions").insert({
          plant_id: thread.plant_id,
          thread_id: thread.id,
          action_type: a.type,
          reason: a.reason,
          params: v.ok
            ? v.params
            : { amount_ml: a.amount_ml, hours: a.hours, threshold: a.threshold },
          status: v.ok ? "pending" : "blocked",
          validation_note: v.note,
        });
        proposed.push(a.type);
      }
    }
    if (thread.plant_id && out.assessment.status !== "unknown") {
      await sb.from("health_assessments").insert({
        plant_id: thread.plant_id,
        status: out.assessment.status,
        summary: out.assessment.summary.slice(0, 500),
      });
    }
    const { error: aErr } = await sb
      .from("chat_messages")
      .insert({ thread_id: thread.id, role: "assistant", content: out.reply, context_mode: mode });
    if (aErr) throw new Error(aErr.message);
    await sb
      .from("chat_threads")
      .update({
        updated_at: new Date().toISOString(),
        ...(thread.title === "New conversation" ? { title: userText.slice(0, 60) } : {}),
      })
      .eq("id", thread.id);
    return { ok: true, proposed };
  });
