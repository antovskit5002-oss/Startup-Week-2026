import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Camera, Droplets, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-monstera.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Plant — AI plant assistant with live sensor data" },
      {
        name: "description",
        content:
          "Fern, your AI plant assistant, combines plant photos with live soil, light and humidity sensor data.",
      },
      { property: "og:title", content: "Smart Plant — AI plant assistant with live sensor data" },
      {
        property: "og:description",
        content:
          "Diagnose plant problems using photos and real readings from your Smart Plant device.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Activity,
    title: "Reads your sensors",
    text: "Soil moisture, humidity, temperature, light and tank level, with 7-day history.",
  },
  {
    icon: Camera,
    title: "Sees your plant",
    text: "Upload a photo and Fern spots yellowing, pests and disease.",
  },
  {
    icon: Droplets,
    title: "Acts safely",
    text: "Suggests watering changes; every action is checked against safety limits and needs your OK.",
  },
  {
    icon: ShieldCheck,
    title: "No hardware? No problem",
    text: "Get photo-based care advice and reminders without a device.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] opacity-75">
              Smart Plant
            </p>
            <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
              Your plant can finally tell you what's wrong.
            </h1>
            <p className="mt-6 max-w-md text-lg opacity-85">
              Fern, the AI plant assistant, combines photos with live readings from your Smart Plant
              pot to explain problems and fix them.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
          <img
            src={hero}
            alt="Monstera in a smart plant pot with a sensor"
            width={1024}
            height={1024}
            className="aspect-square w-full rounded-3xl object-cover shadow-soft"
          />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
