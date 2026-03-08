// Wave 0: These tests define the dashboard copy contract for DASH-01, DASH-02, DASH-04.
// They MUST fail against the current (unmodified) dashboard.
// Run: cd /Users/smurph/surfaced-site && npx playwright test tests/dashboard.spec.ts --project chromium
// Dev server must be running at localhost:3000.

import { test, expect } from '@playwright/test'

// Shared mock helpers
async function mockActiveIdle(page: import('@playwright/test').Page) {
  await page.route('/api/runs/active', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'idle' }),
    })
  })
}

async function mockConfig(page: import('@playwright/test').Page) {
  await page.route('/api/config', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ brand_name: 'JG Wentworth', competitors: {} }),
    })
  })
}

// ─────────────────────────────────────────────
// DASH-01: RunPanel button and state copy
// ─────────────────────────────────────────────

test.describe('DASH-01: RunPanel button and state copy', () => {
  test('idle state: "Start Analysis" button is visible', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)
    await page.goto('/dashboard')

    // FAILS: current button text is "Run Visibility Check"
    await expect(page.getByRole('button', { name: 'Start Analysis' })).toBeVisible()
  })

  test('confirming state: correct confirmation copy is visible', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)
    await page.goto('/dashboard')

    // Click whatever button triggers confirming state (currently "Run Visibility Check")
    const triggerButton = page.locator('button').first()
    await triggerButton.click()

    // FAILS: current text is "This will trigger a full LLM visibility run. Continue?"
    await expect(
      page.getByText('This will start a full visibility + sentiment analysis. Continue?')
    ).toBeVisible()
  })

  test('running state: "Analysis in progress..." text is visible', async ({ page }) => {
    // Mock active endpoint to return running state directly
    await page.route('/api/runs/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'running', job_id: 'test-job' }),
      })
    })
    // Mock status endpoint to stay in running state (no terminal state returned)
    await page.route('/api/runs/test-job/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'running' }),
      })
    })
    await mockConfig(page)
    await page.goto('/dashboard')

    // FAILS: current text is "Run in progress..."
    await expect(page.getByText('Analysis in progress...')).toBeVisible()
  })

  test('error state: text matches "✗ Analysis failed:" pattern', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)

    // Mock POST /api/runs to return error
    await page.route('/api/runs', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'connection refused' }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/dashboard')

    // Advance through idle → confirming → trigger confirm
    const triggerButton = page.locator('button').first()
    await triggerButton.click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    // FAILS: current text is "✗ Run failed: connection refused" (HTML entity &#10007;)
    await expect(page.getByText(/✗ Analysis failed:/)).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// DASH-02: Brand Name helper text
// ─────────────────────────────────────────────

test.describe('DASH-02: Brand Name helper text', () => {
  test('Brand Name field has helper text "The brand tracked across all responses."', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)
    await page.goto('/dashboard')

    // FAILS: helper text does not currently exist in ConfigPanel
    await expect(
      page.getByText('The brand tracked across all responses.')
    ).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// DASH-04: h1 heading and terminology guard
// ─────────────────────────────────────────────

test.describe('DASH-04: Dashboard heading and terminology', () => {
  test('h1 contains "Surfaced"', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)
    await page.goto('/dashboard')

    // FAILS: current h1 text is "LLM Visibility Tracker"
    await expect(page.locator('h1')).toContainText('Surfaced')
  })

  test('h1 does NOT contain "LLM Visibility Tracker"', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)
    await page.goto('/dashboard')

    // FAILS: current h1 text is "LLM Visibility Tracker"
    await expect(page.locator('h1')).not.toContainText('LLM Visibility Tracker')
  })

  test('page contains no user-visible copy matching /run|job|execution/ (case-insensitive)', async ({ page }) => {
    await mockActiveIdle(page)
    await mockConfig(page)
    await page.goto('/dashboard')

    // Check all visible text nodes — FAILS because current copy contains "Run Visibility Check",
    // "Run in progress...", etc.
    // We check the body text content for these banned terms in a way that excludes
    // data-testid attributes and aria labels (which are not user-visible copy).
    const bodyText = await page.evaluate(() => document.body.innerText)
    const forbiddenPattern = /\b(run|job|execution)\b/i
    expect(
      forbiddenPattern.test(bodyText),
      `Page contains forbidden terminology. Found in: "${bodyText.match(forbiddenPattern)?.[0]}"`
    ).toBe(false)
  })
})
