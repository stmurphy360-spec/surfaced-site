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

// E2E-04: Results page iframe renders the HTML report
// E2E-05: CSV download links produce non-zero files with expected column headers
// Precondition: E2E-02/03 completed a run — /api/runs/active returns status 'complete' with job_id
test.describe('E2E-04/05: results page iframe and CSV downloads', () => {
  test('results page shows non-empty iframe and CSV downloads have valid headers', async ({ page }) => {
    // Results page navigation is fast — 30s timeout is sufficient
    test.setTimeout(30_000)

    // Retrieve the completed run's job_id from the active run API
    // E2E-02/03 left the run in 'complete' state with its job_id still accessible
    const runId = await page.evaluate(async () => {
      const res = await fetch('/api/runs/active', { cache: 'no-store' })
      const data = await res.json()
      if (data.status !== 'complete' || !data.job_id) {
        throw new Error(`Expected completed run, got status: ${data.status}, job_id: ${data.job_id}`)
      }
      return data.job_id as string
    })

    // E2E-04: Navigate to results page and assert iframe renders
    await page.goto(`/dashboard/results/${runId}`)
    await expect(page).toHaveURL(`/dashboard/results/${runId}`, { timeout: 15_000 })

    // Assert iframe element is present and src is non-empty
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible({ timeout: 15_000 })
    const iframeSrc = await iframe.getAttribute('src')
    expect(iframeSrc).toBeTruthy()

    // Access iframe body via frameLocator — assert body is visible and has text content
    const frameBody = page.frameLocator('iframe').locator('body')
    await expect(frameBody).toBeVisible({ timeout: 20_000 })
    // Assert report body has meaningful content — at least one visible text node
    const bodyText = await frameBody.innerText()
    expect(bodyText.trim().length).toBeGreaterThan(0)

    // E2E-05: CSV download links exist inside the iframe and produce valid files
    // Phase 30.1 added CSV download links to the report .meta header div
    // Links proxy through Next.js download route: /api/runs/{job_id}/download?file=visibility-csv
    const visibilityLink = page.frameLocator('iframe').getByRole('link', { name: /visibility/i })
    const messagingLink = page.frameLocator('iframe').getByRole('link', { name: /messaging/i })

    await expect(visibilityLink).toBeVisible({ timeout: 10_000 })
    await expect(messagingLink).toBeVisible({ timeout: 10_000 })

    // Download visibility CSV and assert size + headers
    const [visibilityDownload] = await Promise.all([
      page.waitForEvent('download'),
      visibilityLink.click(),
    ])
    const visibilityPath = await visibilityDownload.path()
    expect(visibilityPath).toBeTruthy()

    const fs = await import('fs')
    const visibilityCsvContent = fs.readFileSync(visibilityPath!, 'utf-8')
    expect(visibilityCsvContent.length).toBeGreaterThan(0)

    // Assert visibility CSV header row contains expected column indicators (case-insensitive)
    const visibilityHeader = visibilityCsvContent.split('\n')[0].toLowerCase()
    expect(visibilityHeader).toContain('product')
    expect(visibilityHeader).toContain('visibility')

    // Download messaging alignment CSV and assert size + headers
    const [messagingDownload] = await Promise.all([
      page.waitForEvent('download'),
      messagingLink.click(),
    ])
    const messagingPath = await messagingDownload.path()
    expect(messagingPath).toBeTruthy()

    const messagingCsvContent = fs.readFileSync(messagingPath!, 'utf-8')
    expect(messagingCsvContent.length).toBeGreaterThan(0)

    // Assert messaging alignment CSV header row contains expected column indicators (case-insensitive)
    const messagingHeader = messagingCsvContent.split('\n')[0].toLowerCase()
    expect(messagingHeader).toContain('product')
    // Header will contain 'messaging', 'alignment', or 'ideal' — any confirms correct file
    const hasMessagingIndicator =
      messagingHeader.includes('messaging') ||
      messagingHeader.includes('alignment') ||
      messagingHeader.includes('ideal')
    expect(hasMessagingIndicator).toBe(true)
  })
})
