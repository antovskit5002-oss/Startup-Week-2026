import { createFileRoute } from "@tanstack/react-router";
import { CtaBanner, FeaturesSection, PageHeader, ProductSection } from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";
import lifestyleImg from "@/assets/lifestyle.jpg";

export const Route = createFileRoute("/product")({
  head: () => pageMeta("Our Product", "The Smart Plant device: intelligent sensors, automatic water pump, solar power and AI care optimization."),
  component: ProductPage,
});

function ProductPage() {
  return (
    <>
      <PageHeader eyebrow="Our Product" title="Smart Plant hardware" subtitle="Arduino-powered sensing, automatic watering and solar energy — engineered to keep your plants thriving." />
      <ProductSection />
      <section className="container-x grid items-center gap-12 pb-24 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold md:text-4xl">Less worry. More green.</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Holidays, busy weeks or forgetful days — Smart Plant watches over your plant continuously. When the soil dries out, the pump waters it. When light or temperature drift, the app lets you know with AI-driven advice.
          </p>
        </div>
        <img src={lifestyleImg} alt="Smart Plant in a living room" width={1408} height={1008} loading="lazy" className="rounded-3xl shadow-elegant" />
      </section>
      <FeaturesSection />
      <CtaBanner />
    </>
  );
}
