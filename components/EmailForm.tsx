'use client'

import { useState } from 'react'

type FormState = 'idle' | 'submitted' | 'error'

export function EmailForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    setState('idle')

    const formData = new FormData(e.currentTarget)
    const email = (formData.get('email') as string) ?? ''
    const company = (formData.get('company') as string) ?? ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid work email.')
      setState('error')
      return
    }

    if (!company.trim()) {
      setErrorMsg('Please enter your company name.')
      setState('error')
      return
    }

    // Phase 7: simulate success immediately — no fetch/POST (Phase 8 wires the real API route)
    setState('submitted')
  }

  if (state === 'submitted') {
    return (
      <p className="font-body text-ink text-base">You&apos;re on the list. We&apos;ll be in touch.</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Work email"
        className="w-full rounded-md border border-subtle/30 bg-white px-4 py-3 text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      <input
        type="text"
        name="company"
        placeholder="Company name"
        className="w-full rounded-md border border-subtle/30 bg-white px-4 py-3 text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      {state === 'error' && errorMsg && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        className="w-full rounded-md bg-ocean px-4 py-3 font-body font-semibold text-cream hover:bg-ocean-dark transition-colors"
      >
        Get early access
      </button>
    </form>
  )
}
