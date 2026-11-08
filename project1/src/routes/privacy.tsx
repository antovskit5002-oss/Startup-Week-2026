import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => pageMeta("Privacy Policy", "How Smart Plants collects, uses and protects your personal data."),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <article className="container-x max-w-3xl space-y-5 py-16 text-muted-foreground">
        <p>This is a placeholder privacy policy. Replace it with your final legal text before launch.</p>
        <h2 className="text-2xl font-semibold">Data we collect</h2>
        <p>Account details (name, email), order and shipping information, and messages you send through our forms.</p>
        <h2 className="text-2xl font-semibold">How we use it</h2>
        <p>To process orders, provide customer support, manage your account and Premium gift codes.</p>
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p>For privacy questions, contact us via the contact page.</p>
      </article>
    </>
  ),
});
