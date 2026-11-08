import { Link } from "@tanstack/react-router";
import {
  Droplets, Thermometer, Wind, Sun, Waves, BatteryCharging, BrainCircuit, BellRing,
  Sprout, Cpu, Smartphone, Sparkles, Apple, Camera, Info, ClipboardList, ShieldAlert, Pill, BookOpen, Check,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { site, appPlans, products, formatPrice } from "@/config/site";
import heroImg from "@/assets/hero-device.jpg";
import componentsImg from "@/assets/device-components.jpg";
import lifestyleImg from "@/assets/lifestyle.jpg";

export const productImages = { hero: heroImg, components: componentsImg, lifestyle: lifestyleImg };

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }: { eyebrow: string; title: ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle?: string }) {
  return (
    <section className="bg-gradient-hero">
      <div className="container-x py-20 text-center md:py-28 animate-rise">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}

/* ---------- Product ---------- */
const productHighlights = [
  { icon: Cpu, title: "Intelligent sensors", text: "Arduino-powered sensing of soil, air, temperature and light." },
  { icon: Waves, title: "Automatic water pump", text: "Waters precisely when the soil needs it — never too much." },
  { icon: BatteryCharging, title: "Solar-powered", text: "An integrated solar panel keeps the device running sustainably." },
  { icon: Smartphone, title: "Real-time monitoring", text: "Live conditions sent straight to the Smart Plants mobile app." },
  { icon: BrainCircuit, title: "AI optimization", text: "Care routines that adapt to your plant species and environment." },
];

function ZoomImage({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const canZoom = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px) and (hover: hover)").matches;
  return (
    <div
      className="overflow-hidden rounded-3xl shadow-elegant lg:cursor-zoom-in"
      onMouseEnter={() => canZoom() && setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={onMove}
    >
      <img
        src={src} alt={alt} width={width} height={height} loading="lazy"
        className="block w-full transition-transform duration-300 ease-out"
        style={{ transformOrigin: origin, transform: zoomed ? "scale(2)" : "scale(1)" }}
      />
    </div>
  );
}

export function ProductSection() {
  return (
    <section className="py-24">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-hero" />
          <ZoomImage src={componentsImg} alt="Smart Plant device components: sensors, pump, solar panel and controller" width={1408} height={1008} />
        </div>
        <div>
          <SectionHeading center={false} eyebrow="Our Product" title={<>The Smart Plant device. <span className="text-gradient">Care that runs itself.</span></>} subtitle="A compact device that sits in or beside your pot, senses everything your plant experiences and acts on it — so you spend less time worrying and more time enjoying greenery." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {productHighlights.map((h) => (
              <div key={h.title} className="card-lift rounded-2xl border border-border bg-card p-5">
                <h.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-base font-semibold">{h.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{h.text}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="hero" size="lg" className="mt-8 h-12 px-8">
            <Link to="/shop">Shop Smart Plant</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
const steps = [
  { icon: Sprout, title: "Choose your plant", text: "Pick any houseplant — from monstera to herbs." },
  { icon: Cpu, title: "Set up your device", text: "Insert the probe, place the solar panel, fill the reservoir." },
  { icon: Smartphone, title: "Connect the app", text: "Pair the hardware with the Smart Plants iOS app in seconds." },
  { icon: Sparkles, title: "Let it optimize", text: "Intelligent monitoring and watering keep your plant thriving." },
];

export function HowItWorksSection() {
  return (
    <section className="bg-surface py-24">
      <div className="container-x">
        <SectionHeading eyebrow="How It Works" title="Four steps to effortless growth" subtitle="From unboxing to automated care in minutes." />
        <div className="relative mt-16 grid gap-8 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-10 hidden h-0.5 bg-gradient-primary opacity-40 md:block" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-card shadow-soft">
                <s.icon className="h-8 w-8 text-primary" />
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-navy text-xs font-bold text-navy-foreground">{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[15rem] text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */
const features = [
  { icon: Droplets, title: "Soil Moisture Monitoring", text: "Continuous readings so roots get water exactly when needed." },
  { icon: Thermometer, title: "Temperature Monitoring", text: "Know when it's too hot or too cold for your species." },
  { icon: Wind, title: "Air Humidity Monitoring", text: "Track ambient humidity for tropical and delicate plants." },
  { icon: Sun, title: "Sunlight Monitoring", text: "Measure light intensity and find the perfect spot." },
  { icon: Waves, title: "Automatic Watering", text: "A built-in pump delivers precise, gentle watering." },
  { icon: BatteryCharging, title: "Solar Power", text: "Clean energy keeps the device running without cables." },
  { icon: BrainCircuit, title: "AI Plant Optimization", text: "Care that learns from your plant's conditions over time." },
  { icon: BellRing, title: "Smart Notifications", text: "Timely alerts when your plant needs attention." },
];

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Features" title="Everything your plant needs, measured" subtitle="Eight capabilities working together in one elegant device." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="group card-lift animate-rise rounded-3xl border border-border bg-card p-6" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface transition-colors duration-300 group-hover:bg-gradient-primary">
                <f.icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Phone mockup ---------- */
export function PhoneMockup({ variant }: { variant: "identify" | "dashboard" }) {
  return (
    <div className="relative w-[230px] rounded-[2.6rem] border-[10px] border-navy bg-navy shadow-elegant sm:w-[260px]">
      <div className="absolute left-1/2 top-1.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-navy" />
      <div className="overflow-hidden rounded-[2rem] bg-surface">
        {variant === "identify" ? (
          <div className="p-4 pt-9">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plant identified</p>
            <div className="mt-2 overflow-hidden rounded-2xl">
              <img src={heroImg} alt="" className="h-36 w-full object-cover object-top" loading="lazy" />
            </div>
            <h4 className="mt-3 text-lg font-semibold">Monstera deliciosa</h4>
            <p className="text-[11px] text-muted-foreground">Swiss cheese plant · 98% match</p>
            <div className="mt-3 space-y-2">
              {[["Water", "Every 7–10 days"], ["Light", "Bright, indirect"], ["Health", "No disease detected"]].map(([a, b]) => (
                <div key={a} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-[11px]">
                  <span className="font-semibold text-navy">{a}</span>
                  <span className="text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 pt-9">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Living room</p>
            <h4 className="text-lg font-semibold">Fiddle leaf fig</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[[Droplets, "Moisture", "Optimal"], [Thermometer, "Temp", "23°C"], [Sun, "Light", "Good"], [Wind, "Humidity", "54%"]].map(([I, a, b]) => {
                const Icon = I as typeof Sun;
                return (
                  <div key={a as string} className="rounded-2xl bg-card p-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="mt-2 text-[10px] text-muted-foreground">{a as string}</p>
                    <p className="text-sm font-semibold text-navy">{b as string}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-2xl bg-gradient-primary p-3 text-primary-foreground">
              <p className="text-[10px] uppercase tracking-wider opacity-80">Smart watering</p>
              <p className="text-sm font-semibold">Active · next in 2 days</p>
            </div>
            <div className="mt-2 rounded-2xl bg-card p-3 text-[11px] text-muted-foreground">
              <span className="font-semibold text-navy">AI tip:</span> Rotate the pot weekly for even growth.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- App showcase ---------- */
const appFeatures = [
  { icon: Camera, text: "Identify plants using photographs" },
  { icon: Info, text: "Receive detailed plant information" },
  { icon: ClipboardList, text: "Get personalized care instructions" },
  { icon: ShieldAlert, text: "Detect potential diseases through image analysis" },
  { icon: Pill, text: "Recommendations for treating plant problems" },
  { icon: BookOpen, text: "Learn optimal conditions for each species" },
];

export function AppShowcaseSection({ showDetailsLink = true }: { showDetailsLink?: boolean }) {
  return (
    <section id="app" className="overflow-hidden bg-gradient-hero py-24">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeading center={false} eyebrow="Mobile App" title="Meet Your Personal AI Plant Assistant" subtitle={`Our separate iOS app works on its own — no hardware required. Snap a photo, identify your plant and get expert care guidance for ${site.appPriceLabel}.`} />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {appFeatures.map((f) => (
              <li key={f.text} className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 text-sm text-navy backdrop-blur">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {f.text}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl border border-leaf/40 bg-accent p-4 text-sm text-accent-foreground">
            <strong>With Smart Plant hardware:</strong> the app also receives live sensor data, enables hardware monitoring and unlocks automated watering.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="navy" size="lg" className="h-12 px-6">
              <a href={site.appStoreUrl} target="_blank" rel="noreferrer"><Apple className="h-5 w-5" /> Download on the App Store</a>
            </Button>
            {showDetailsLink && (
              <Button asChild variant="soft" size="lg" className="h-12 px-6">
                <Link to="/app">Discover App Features</Link>
              </Button>
            )}
          </div>
        </div>
        <div className="relative flex justify-center gap-6">
          <div className="animate-float"><PhoneMockup variant="identify" /></div>
          <div className="mt-16 hidden animate-float-slow sm:block"><PhoneMockup variant="dashboard" /></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
export function PricingSection() {
  const bundle = products[0]!;
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Pricing" title="Choose how you grow" subtitle="Start with the app, or go fully automated with the Smart Plant bundle." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="relative rounded-3xl bg-gradient-navy p-8 text-navy-foreground shadow-elegant lg:-mt-4 lg:mb-[-1rem]">
            <span className="mb-4 inline-block rounded-full bg-leaf px-3 py-1 text-xs font-bold text-leaf-foreground">Best value</span>
            <h3 className="text-xl font-semibold text-navy-foreground">{bundle.name}</h3>
            <p className="mt-4 font-display text-4xl font-semibold">{formatPrice(bundle.priceCents)}</p>
            <p className="text-sm text-navy-foreground/60">Hardware + app + Premium</p>
            <ul className="mt-6 space-y-3 text-sm">
              {bundle.includes.map((f) => (
                <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-leaf" /> {f}</li>
              ))}
            </ul>
            <Button asChild variant="hero" className="mt-8 h-11 w-full"><Link to="/shop/$productId" params={{ productId: bundle.id }}>View bundle</Link></Button>
          </div>
          {appPlans.map((p) => (
            <div key={p.id} className="rounded-3xl border border-border bg-card p-8 card-lift">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-4 font-display text-4xl font-semibold text-navy">{p.priceLabel}</p>
              <p className="text-sm text-muted-foreground">{p.note}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button asChild variant="soft" className="mt-8 h-11 w-full">
                <a href={site.appStoreUrl} target="_blank" rel="noreferrer">View on App Store</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="pb-24">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-navy px-8 py-16 text-center md:px-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-leaf/30 blur-3xl" />
          <h2 className="relative text-3xl font-semibold text-navy-foreground md:text-5xl">Give your plants the intelligence they deserve.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-navy-foreground/70">Join the growing community caring for plants the smarter way.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg" className="h-12 px-8"><Link to="/shop">Shop Smart Plant</Link></Button>
            <Button asChild variant="soft" size="lg" className="h-12 px-8"><Link to="/business">For Businesses</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
