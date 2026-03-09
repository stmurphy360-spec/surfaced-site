'use client'

import { useState, useEffect, useRef } from 'react'

type ConfigData = {
  brand_name: string
  competitors: Record<string, string[]>
  claims: Record<string, string[]>
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function humanizeKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function ConfigPanel() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [newCompetitor, setNewCompetitor] = useState<Record<string, string>>({})
  const [newClaim, setNewClaim] = useState<Record<string, string>>({})
  const configRef = useRef<ConfigData | null>(null)

  function loadConfig() {
    fetch('/api/config', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          setLoadError(`Could not reach config API (${res.status})`)
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) {
          configRef.current = data
          setConfig(data)
        }
      })
      .catch(() => setLoadError('Could not reach config API'))
  }

  useEffect(() => { loadConfig() }, [])

  async function handleSave() {
    const current = configRef.current
    if (!current) return
    setSaveState('saving')
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      })
      if (res.ok) {
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 3000)
      } else {
        setSaveState('error')
        setTimeout(() => setSaveState('idle'), 5000)
      }
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 5000)
    }
  }

  function addCompetitor(productLine: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed || !config) return
    const next = {
      ...config,
      competitors: {
        ...config.competitors,
        [productLine]: [...(config.competitors[productLine] ?? []), trimmed],
      },
    }
    configRef.current = next
    setConfig(next)
    setNewCompetitor(prev => ({ ...prev, [productLine]: '' }))
  }

  function removeCompetitor(productLine: string, index: number) {
    if (!config) return
    const next = {
      ...config,
      competitors: {
        ...config.competitors,
        [productLine]: config.competitors[productLine].filter((_, i) => i !== index),
      },
    }
    configRef.current = next
    setConfig(next)
  }

  function addClaim(productLine: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed || !config) return
    const next = {
      ...config,
      claims: {
        ...config.claims,
        [productLine]: [...(config.claims[productLine] ?? []), trimmed],
      },
    }
    configRef.current = next
    setConfig(next)
    setNewClaim(prev => ({ ...prev, [productLine]: '' }))
  }

  function removeClaim(productLine: string, index: number) {
    if (!config) return
    const next = {
      ...config,
      claims: {
        ...config.claims,
        [productLine]: config.claims[productLine].filter((_, i) => i !== index),
      },
    }
    configRef.current = next
    setConfig(next)
  }

  if (!config) {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-6">
        <h2 className="font-medium text-ink text-lg">Configuration</h2>
        <p className="text-stone-400 text-sm">
          {loadError ?? 'Loading config...'}
        </p>
      </div>
    )
  }

  const saveLabel =
    saveState === 'saving'
      ? 'Saving...'
      : saveState === 'saved'
        ? 'Saved'
        : saveState === 'error'
          ? 'Error'
          : 'Save'

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-6">
      <h2 className="font-medium text-ink text-lg">Configuration</h2>

      {/* Brand name */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-ink" htmlFor="brand-name">
          Brand Name
        </label>
        <p className="text-sm text-stone-400">The brand tracked across all responses.</p>
        <input
          id="brand-name"
          type="text"
          value={config.brand_name}
          onChange={e => {
            const next = { ...config, brand_name: e.target.value }
            configRef.current = next
            setConfig(next)
          }}
          className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ocean"
        />
      </div>

      {/* Competitors per product line */}
      {Object.entries(config.competitors).map(([productLine, competitors]) => (
        <div key={productLine} className="space-y-2">
          <p className="text-sm font-medium text-ink">{humanizeKey(productLine)}</p>

          {/* Existing competitors */}
          <ul className="space-y-1">
            {competitors.map((competitor, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-sm text-ink">{competitor}</span>
                <button
                  onClick={() => removeCompetitor(productLine, index)}
                  className="text-stone-400 hover:text-red-500 text-xs px-1"
                  aria-label={`Remove ${competitor}`}
                >
                  x
                </button>
              </li>
            ))}
          </ul>

          {/* Add competitor */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add competitor..."
              value={newCompetitor[productLine] ?? ''}
              onChange={e =>
                setNewCompetitor(prev => ({ ...prev, [productLine]: e.target.value }))
              }
              onKeyDown={e => {
                if (e.key === 'Enter') addCompetitor(productLine, newCompetitor[productLine] ?? '')
              }}
              className="flex-1 rounded-md border border-stone-200 px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ocean"
            />
            <button
              onClick={() => addCompetitor(productLine, newCompetitor[productLine] ?? '')}
              className="rounded-md border border-stone-200 px-3 py-1.5 text-sm text-ink hover:bg-stone-50"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="rounded-md bg-ocean px-4 py-2 font-body font-semibold text-cream hover:bg-ocean-dark disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {saveLabel}
      </button>
    </div>
  )
}
