import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Droplets,
  MessageCircle,
  Sun,
  Thermometer,
  Waves,
  Container,
} from "lucide-react";
import { plantQuery } from "@/lib/queries";
import { refreshDevice } from "@/lib/plants.functions";
import { supabase } from "@/integrations/supabase/client";
import { ActionCard } from "@/components/ActionCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/plants/$plantId")({
  head: () => ({
    meta: [
      { title: "Plant details — Smart Plant" },
      { name: "description", content: "Live sensors, history and actions for your plant." },
    ],
  }),
  component: PlantPage,
});

const fmtTime = (s: string) =>
  new Date(s).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });

function PlantPage() {
  const { plantId } = Route.useParams();
  const { data } = useQuery(plantQuery(plantId));
  const refresh = useServerFn(refreshDevice);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [range, setRange] = useState("24");

  useEffect(() => {
    let alive = true;
    const tick = () =>
      refresh({ data: { plantId } }).then(() => {
        if (alive) void qc.invalidateQueries({ queryKey: ["plant", plantId] });
      });
    tick();
    const t = setInterval(tick, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [plantId, refresh, qc]);

  const series = useMemo(() => {
    if (!data) return [];
    const cut = Date.now() - Number(range) * 3600e3;
    return data.readings
      .filter((r) => new Date(r.recorded_at).getTime() >= cut)
      .map((r) => ({
        t: fmtTime(r.recorded_at),
        moisture: Number(r.soil_moisture),
        humidity: Number(r.humidity),
        temperature: Number(r.temperature),
        light: Number(r.light),
      }));
  }, [data, range]);

  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const { plant, device, readings, waterings, alerts, actions, health } = data;
  const latest = readings.at(-1);
  const ageMin = latest
    ? Math.round((Date.now() - new Date(latest.recorded_at).getTime()) / 60000)
    : null;

  async function ask() {
    const { data: t, error } = await supabase
      .from("chat_threads")
      .insert({ plant_id: plantId, title: `About ${plant.name}` })
      .select()
      .single();
    if (!error && t) navigate({ to: "/assistant/$threadId", params: { threadId: t.id } });
  }

  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const next = d.getTime() + 86400e3;
    return {
      day: d.toLocaleDateString([], { weekday: "short" }),
      waterings: waterings.filter((w) => {
        const x = new Date(w.occurred_at).getTime();
        return x >= d.getTime() && x < next;
      }).length,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/garden" className="text-sm text-muted-foreground hover:text-foreground">
            ← Garden
          </Link>
          <h1 className="mt-1 text-4xl font-semibold">{plant.name}</h1>
          <p className="italic text-muted-foreground">
            {plant.species}
            {plant.location ? ` · ${plant.location}` : ""}
          </p>
        </div>
        <Button className="rounded-full" onClick={ask}>
          <MessageCircle className="h-4 w-4" />
          Ask Fern about {plant.name}
        </Button>
      </div>

      {!device ? (
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Standalone plant</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No Smart Plant device connected. The assistant uses photos and plant-care knowledge.
            Suggested watering reminder: every {plant.reminder_every_days} days.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-live" />
            {device.name} ·{" "}
            {device.connection === "simulated" ? "simulated device" : device.connection} ·{" "}
            {ageMin != null ? `updated ${ageMin} min ago` : "no readings"}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat
              icon={Droplets}
              label="Soil moisture"
              value={latest?.soil_moisture}
              unit="%"
              range={[plant.moisture_min, plant.moisture_max]}
              cls="text-water"
            />
            <Stat
              icon={Waves}
              label="Air humidity"
              value={latest?.humidity}
              unit="%"
              range={[plant.humidity_min, plant.humidity_max]}
              cls="text-chart-2"
            />
            <Stat
              icon={Thermometer}
              label="Temperature"
              value={latest?.temperature}
              unit="°C"
              range={[plant.temp_min, plant.temp_max]}
              cls="text-chart-3"
            />
            <Stat
              icon={Sun}
              label="Light"
              value={latest?.light}
              unit="%"
              range={[plant.light_min, plant.light_max]}
              cls="text-sun"
            />
            <Stat
              icon={Container}
              label="Water tank"
              value={latest?.tank_level}
              unit="%"
              cls="text-primary"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Automatic watering:{" "}
            <b className="text-foreground">{plant.auto_watering ? "on" : "off"}</b> · waters below{" "}
            {plant.watering_threshold}%
            {plant.watering_paused_until && new Date(plant.watering_paused_until) > new Date()
              ? ` · paused until ${fmtTime(plant.watering_paused_until)}`
              : ""}
          </div>

          <section className="rounded-3xl border bg-card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">History</h2>
              <Tabs value={range} onValueChange={setRange}>
                <TabsList>
                  <TabsTrigger value="24">24 hours</TabsTrigger>
                  <TabsTrigger value="168">7 days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <ChartBlock
              title="Soil moisture (%)"
              data={series}
              k="moisture"
              color="var(--chart-1)"
              band={[plant.moisture_min, plant.moisture_max]}
              area
            />
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ChartBlock
                title="Temperature (°C)"
                data={series}
                k="temperature"
                color="var(--chart-3)"
                band={[plant.temp_min, plant.temp_max]}
              />
              <ChartBlock
                title="Light (%)"
                data={series}
                k="light"
                color="var(--chart-4)"
                band={[plant.light_min, plant.light_max]}
                area
              />
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Waterings per day (last 7 days)</p>
              <div className="flex h-24 items-end gap-2">
                {daily.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-water"
                      style={{ height: `${Math.max(4, d.waterings * 28)}px` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {d.day} · {d.waterings}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Device actions</h2>
          {actions.length ? (
            <div className="space-y-3">
              {actions.map((a) => (
                <ActionCard key={a.id} action={a} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No actions yet. Fern will suggest some when they'd help.
            </p>
          )}
        </section>
        <section className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-semibold">Alerts</h2>
            {alerts.length ? (
              alerts.map((a) => (
                <div key={a.id} className="mb-2 flex gap-2 rounded-xl bg-warning/15 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  {a.message}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {fmtTime(a.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No alerts.</p>
            )}
          </div>
          <div>
            <h2 className="mb-3 text-xl font-semibold">Health assessments</h2>
            {health.length ? (
              health.map((h) => (
                <div key={h.id} className="mb-2 rounded-xl border p-3 text-sm">
                  <b className="capitalize">{h.status}</b> — {h.summary}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">None yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  unit,
  range,
  cls,
}: {
  icon: typeof Droplets;
  label: string;
  value: number | null | undefined;
  unit: string;
  range?: [number, number];
  cls: string;
}) {
  const out = range && value != null && (value < range[0] || value > range[1]);
  return (
    <div className="rounded-2xl border bg-card p-4">
      <Icon className={`h-5 w-5 ${cls}`} />
      <p className="mt-3 text-2xl font-semibold">{value != null ? `${value}${unit}` : "—"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {range && (
        <p
          className={`mt-1 text-xs ${out ? "font-semibold text-destructive" : "text-muted-foreground"}`}
        >
          Ideal {range[0]}–{range[1]}
          {unit}
        </p>
      )}
    </div>
  );
}

function ChartBlock({
  title,
  data,
  k,
  color,
  band,
  area,
}: {
  title: string;
  data: Record<string, number | string>[];
  k: string;
  color: string;
  band: [number, number];
  area?: boolean;
}) {
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} minTickGap={40} />
      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={30} />
      <Tooltip
        contentStyle={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      />
      <ReferenceArea y1={band[0]} y2={band[1]} fill="var(--success)" fillOpacity={0.08} />
    </>
  );
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {area ? (
            <AreaChart data={data}>
              {common}
              <Area
                type="monotone"
                dataKey={k}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              {common}
              <Line type="monotone" dataKey={k} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
