import { test, expect } from '@playwright/test'

// E2E-01: User completes setup wizard and arrives at /dashboard
// Targets live Railway deployment — no mocking
// Entry: /wizard?force=true bypasses WIZ-04 bypass behavior
test.describe('E2E-01: wizard completion', () => {
  test('user drives all 6 wizard steps and lands on /dashboard', async ({ page }) => {
    // Navigate using force param to bypass existing-config redirect
    await page.goto('/wizard?force=true')

    // Step 1: Brand name
    await expect(page.getByText('Step 1 of 6')).toBeVisible()
    await expect(page.getByPlaceholder(/brand name/i)).toBeVisible()
    await page.getByPlaceholder(/brand name/i).fill('JG Wentworth')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 2: Products
    await expect(page.getByText('Step 2 of 6')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: Claims (brand messaging section must be visible)
    await expect(page.getByText('Step 3 of 6')).toBeVisible()
    await expect(page.getByText('Brand Messaging')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 4: Competitors
    await expect(page.getByText('Step 4 of 6')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 5: LLM selection (GPT-4o pre-selected and locked — just continue)
    await expect(page.getByText('Step 5 of 6')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 6: Review — Launch Surfaced submits the wizard
    await expect(page.getByText('Step 6 of 6')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Launch Surfaced' })).toBeVisible()
    await page.getByRole('button', { name: 'Launch Surfaced' }).click()

    // Assert dashboard arrival (config POST + redirect)
    await expect(page).toHaveURL('/dashboard', { timeout: 15_000 })
  })
})

// E2E-02: Run trigger and status polling to complete
// E2E-03: Real LLM pipeline executes all stages (validated by complete status)
// Timeout: 10 minutes — full production prompt library with real OpenAI + Haiku calls
test.describe('E2E-02/03: run trigger and pipeline completion', () => {
  test('user triggers run from dashboard and polls to complete status', async ({ page }) => {
    // 10-minute timeout — full LLM pipeline with real API calls
    test.setTimeout(600_000)

    await page.goto('/dashboard')

    // Dashboard must be loaded (wizard completed in E2E-01 wrote real config)
    // Assert Start Analysis button is visible — confirms idle state
    await expect(page.getByRole('button', { name: 'Start Analysis' })).toBeVisible({ timeout: 15_000 })

    // Click Start Analysis → triggers confirming state
    await page.getByRole('button', { name: 'Start Analysis' }).click()

    // Confirm dialog appears — click Confirm to POST /api/runs
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Pipeline is now starting/running — assert running state UI appears
    await expect(page.getByText('Analysis in progress...')).toBeVisible({ timeout: 30_000 })

    // Poll /api/runs/active until status === 'complete' or 'failed'
    // Uses page.waitForFunction which runs in browser context via fetch
    // Polls every 10 seconds, up to the test timeout (600s)
    const finalStatus = await page.waitForFunction(
      async () => {
        try {
          const res = await fetch('/api/runs/active', { cache: 'no-store' })
          const data = await res.json()
          // Return status string once terminal — null keeps polling
          if (data.status === 'complete' || data.status === 'failed') {
            return data.status
          }
          return null
        } catch {
          return null
        }
      },
      null,
      { timeout: 600_000, polling: 10_000 }
    )

    // E2E-02: Status reached a terminal state
    // E2E-03: That terminal state must be 'complete' — not 'failed'
    // A 'failed' status means a pipeline stage did not complete (LLM call, extraction, scoring, etc.)
    expect(await finalStatus.jsonValue()).toBe('complete')
  })
})
