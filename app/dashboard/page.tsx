'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RunPanel } from '@/components/RunPanel'
import { parseDashboardConfig, type ProductLineCard } from '@/lib/dashboard-config'
import './dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [cards, setCards] = useState<ProductLineCard[]>([])

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.brand_name) {
          router.replace('/wizard')
        } else {
          setCards(parseDashboardConfig(data))
          setReady(true)
        }
      })
      .catch(() => {
        // Fail open — don't redirect on network error
        setReady(true)
      })
  }, [router])

  if (!ready) return null

  return (
    <div className="dashboard-root">
      <div className="dash-topbar">
        <span className="dash-topbar-title">Launch Pad</span>
      </div>

      <div className="dash-body">
        <div className="dash-content">
          <div className="dash-run-panel">
            <RunPanel />
          </div>

          {cards.length > 0 && (
            <>
              <div className="dash-section-label">Product Lines</div>
              {cards.map((card) => (
                <div
                  key={card.name}
                  className={`dash-card${card.isSkipped ? ' dash-card--skipped' : ''}`}
                >
                  <div className="dash-card-header">
                    <span className="dash-card-title">{card.displayName}</span>
                    {card.isSkipped ? (
                      <span className="dash-status-skipped">Skipped</span>
                    ) : (
                      <span className="dash-status-active">Active</span>
                    )}
                  </div>

                  {card.competitors.length > 0 ? (
                    <div className="dash-competitors">
                      {card.competitors.map((comp) => (
                        <span key={comp} className="dash-competitor-tag">{comp}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="dash-empty">No competitors configured</div>
                  )}

                  <div className="dash-claims-count">
                    {card.claimsCount} {card.claimsCount === 1 ? 'claim' : 'claims'} configured
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
