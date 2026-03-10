import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Surfaced',
}

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-sans text-text-primary">
      <h1 className="font-sans font-bold text-3xl mb-8">Terms of Service</h1>
      <p className="text-base leading-relaxed text-text-secondary">
        Surfaced is currently in early access. By joining the waitlist or using the platform,
        you agree to use the service for its intended purpose of monitoring brand visibility
        in AI-generated content. We reserve the right to update these terms as the product evolves.
      </p>
      <p className="mt-8 text-sm text-text-secondary">
        <Link href="/" className="underline hover:text-text-primary transition-colors">
          Back to home
        </Link>
      </p>
    </main>
  )
}
