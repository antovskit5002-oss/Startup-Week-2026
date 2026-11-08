import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Thermometer, Sun, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-device.jpg";
import lifestyleImg from "@/assets/lifestyle.jpg";
import {
  AppShowcaseSection, CtaBanner, Eyebrow, FeaturesSection, HowItWorksSection, PricingSection, ProductSection,
} from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Your Plants. Our Intelligence.", "Smart Plant device with sensors, solar power and automatic watering, plus an AI plant assistant app."),
  component: Index,
});

const floating = [
  { icon: Droplets, label: "Soil Moisture", value: "Optimal", pos: "left-0 top-16 md:-left-8" },
  { icon: Thermometer, label: "Temperature", value: "23°C", pos: "right-0 top-1/3 md:-right-6" },
  { icon: Sun, label: "Light", value: "Good", pos: "left-2 bottom-28 md:-left-12" },
  { icon: Waves, label: "Smart Watering", value: "Active", pos: "right-4 bottom-10 md:-right-2" },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container-x grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-rise">
            <Eyebrow>AI · IoT · Nature</Eyebrow>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] md:text-7xl">
              Your Plants. <span className="text-gradient">Our Intelligence.</span> Perfect Growth.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A solar-powered device that sits in your pot, checks soil, light and temperature, and waters your plant automatically — paired with an AI plant assistant app on your iPhone.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Button asChild variant="hero" size="lg" className="h-13 px-8 text-base"><Link to="/product">See how it works</Link></Button>
              <Link to="/app" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Only want the app? →</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 -z-0 rounded-full bg-primary/25 blur-3xl" />
            <img src={heroImg} alt="Smart Plant device with a healthy monstera" width={1200} height={1408} className="relative rounded-[2.5rem] shadow-elegant" />
            {floating.map((f, i) => (
              <div key={f.label} className={`absolute ${f.pos} hidden sm:flex lg:max-xl:hidden ${i % 2 ? "animate-float-slow" : "animate-float"} items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-soft backdrop-blur`}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface"><f.icon className="h-4 w-4 text-primary" /></span>
                <div>
                  <p className="text-[11px] text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-semibold text-navy">{f.value}</p>
                </div>
              </div>
            ))}
            <p className="mt-4 text-center text-xs text-muted-foreground">Illustrative values, not live readings.</p>
          </div>
        </div>
      </section>
      <ProductSection />
      <HowItWorksSection />
      <FeaturesSection />
      <section className="container-x pb-8">
        <img src={lifestyleImg} alt="Smart Plant on a sunny windowsill" width={1408} height={1008} loading="lazy" className="h-[420px] w-full rounded-[2.5rem] object-cover shadow-soft" />
      </section>
      <AppShowcaseSection />
      <PricingSection />
      <CtaBanner />
    </>
  );
}
