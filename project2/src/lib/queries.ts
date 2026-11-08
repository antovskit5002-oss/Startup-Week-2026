import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const plantsQuery = queryOptions({
  queryKey: ["plants"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("plants")
      .select("*, devices(*)")
      .order("created_at");
    if (error) throw error;
    const ids = (data ?? []).map((p) => p.id);
    const latest: Record<
      string,
      { soil_moisture: number | null; recorded_at: string } | undefined
    > = {};
    for (const id of ids) {
      const { data: r } = await supabase
        .from("sensor_readings")
        .select("soil_moisture,recorded_at")
        .eq("plant_id", id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      latest[id] = r ?? undefined;
    }
    return (data ?? []).map((p) => ({ ...p, device: p.devices ?? null, latest: latest[p.id] }));
  },
});

export const plantQuery = (id: string) =>
  queryOptions({
    queryKey: ["plant", id],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400e3).toISOString();
      const [plant, device, readings, waterings, alerts, actions, health] = await Promise.all([
        supabase.from("plants").select("*").eq("id", id).single(),
        supabase.from("devices").select("*").eq("plant_id", id).maybeSingle(),
        supabase
          .from("sensor_readings")
          .select("*")
          .eq("plant_id", id)
          .gte("recorded_at", since)
          .order("recorded_at"),
        supabase
          .from("watering_events")
          .select("*")
          .eq("plant_id", id)
          .gte("occurred_at", since)
          .order("occurred_at", { ascending: false }),
        supabase
          .from("alerts")
          .select("*")
          .eq("plant_id", id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("device_actions")
          .select("*")
          .eq("plant_id", id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("health_assessments")
          .select("*")
          .eq("plant_id", id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);
      if (plant.error) throw plant.error;
      return {
        plant: plant.data,
        device: device.data,
        readings: readings.data ?? [],
        waterings: waterings.data ?? [],
        alerts: alerts.data ?? [],
        actions: actions.data ?? [],
        health: health.data ?? [],
      };
    },
  });

export const threadsQuery = queryOptions({
  queryKey: ["threads"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("*, plants(name)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const threadQuery = (id: string) =>
  queryOptions({
    queryKey: ["thread", id],
    queryFn: async () => {
      const [t, m, a] = await Promise.all([
        supabase
          .from("chat_threads")
          .select("*, plants(id,name,species, devices(id))")
          .eq("id", id)
          .single(),
        supabase.from("chat_messages").select("*").eq("thread_id", id).order("created_at"),
        supabase.from("device_actions").select("*").eq("thread_id", id).order("created_at"),
      ]);
      if (t.error) throw t.error;
      const msgs = m.data ?? [];
      const paths = msgs.map((x) => x.image_path).filter((x): x is string => !!x);
      const urls: Record<string, string> = {};
      if (paths.length) {
        const { data } = await supabase.storage.from("plant-photos").createSignedUrls(paths, 3600);
        for (const s of data ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
      }
      return {
        thread: t.data,
        messages: msgs.map((x) => ({
          ...x,
          imageUrl: x.image_path ? urls[x.image_path] : undefined,
        })),
        actions: a.data ?? [],
      };
    },
  });
