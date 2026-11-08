import { createFileRoute } from "@tanstack/react-router";
import { CtaBanner, HowItWorksSection, PageHeader } from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () => pageMeta("How It Works", "Choose your plant, set up the device, connect the app and let intelligent technology care for it."),
  component: () => (
    <>
      <PageHeader eyebrow="How It Works" title="From unboxing to automated care" subtitle="Setting up Smart Plant takes minutes. Here's the journey." />
      <HowItWorksSection />
      <div className="h-24" />
      <CtaBanner />
    </>
  ),
});
