import { createFileRoute } from "@tanstack/react-router";
import { AppShowcaseSection, CtaBanner, PricingSection } from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/app")({
  head: () => pageMeta("Mobile App — AI Plant Assistant", "Identify plants, detect diseases and get personalized care with the Smart Plants iOS app — with or without hardware."),
  component: () => (
    <>
      <AppShowcaseSection showDetailsLink={false} />
      <PricingSection />
      <CtaBanner />
    </>
  ),
});
