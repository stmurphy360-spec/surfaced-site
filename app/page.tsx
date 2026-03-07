import { Wordmark } from "@/components/Wordmark";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="p-6">
        <Wordmark />
      </nav>
      <main className="px-6 pt-16 max-w-2xl">
        <h1 className="font-display text-5xl text-ink mb-4">
          Know exactly how your brand appears in AI answers.
        </h1>
        <p className="font-body text-subtle text-lg mb-8">
          Brand scaffold placeholder — Phase 7 builds the real page.
        </p>
        <span className="inline-block w-8 h-1 bg-ocean rounded" />
      </main>
    </div>
  );
}
