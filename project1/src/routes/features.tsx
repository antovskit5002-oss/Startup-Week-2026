import { createFileRoute } from "@tanstack/react-router";
import { CtaBanner, FeaturesSection, PageHeader } from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/features")({
  head: () => pageMeta("Features", "Soil moisture, temperature, humidity and sunlight monitoring, automatic watering, solar power and AI optimization."),
  component: () => (
    <>
      <PageHeader eyebrow="Features" title="Built to sense. Designed to care." subtitle="Every Smart Plant capability, at a glance." />
      <FeaturesSection />
      <CtaBanner />
    </>
  ),
});
