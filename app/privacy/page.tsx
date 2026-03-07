import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Surfaced',
}

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-body text-ink">
      <h1 className="font-display text-3xl mb-8">Privacy Policy</h1>
      <p className="text-base leading-relaxed text-subtle">
        Surfaced collects your email address and company name when you join the waitlist.
        We use this information solely to notify you about early access and product updates —
        we do not sell or share it with third parties. You can unsubscribe at any time
        using the link in any email we send you.
      </p>
      <p className="mt-8 text-sm text-subtle">
        <Link href="/" className="underline hover:text-ink transition-colors">
          Back to home
        </Link>
      </p>
    </main>
  )
}
