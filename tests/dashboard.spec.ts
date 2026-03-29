// Dashboard tests for the prompt editor UI.
// Run: npx playwright test tests/dashboard.spec.ts --project chromium
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

// ─────────────────────────────────────────────
// Prompt editor: core UI elements
// ─────────────────────────────────────────────

test.describe('Prompt Editor: core elements', () => {
  test('brand name input is visible', async ({ page }) => {
    await mockActiveIdle(page)
    await page.goto('/dashboard')
    await expect(page.getByLabel('Brand Name')).toBeVisible()
  })

  test('prompts section is visible', async ({ page }) => {
    await mockActiveIdle(page)
    await page.goto('/dashboard')
    await expect(page.getByText('Prompts')).toBeVisible()
  })

  test('competitors section is visible with optional label', async ({ page }) => {
    await mockActiveIdle(page)
    await page.goto('/dashboard')
    await expect(page.getByText('Competitors')).toBeVisible()
    await expect(page.getByText('(optional)')).toBeVisible()
  })

  test('Run Analysis button is visible but disabled with no prompts', async ({ page }) => {
    await mockActiveIdle(page)
    await page.goto('/dashboard')
    const btn = page.getByRole('button', { name: /Run Analysis/ })
    await expect(btn).toBeVisible()
    await expect(btn).toBeDisabled()
  })
})

// ─────────────────────────────────────────────
// Prompt editor: adding prompts enables run
// ─────────────────────────────────────────────

test.describe('Prompt Editor: prompt management', () => {
  test('adding a prompt and brand name enables Run Analysis', async ({ page }) => {
    await mockActiveIdle(page)
    await page.goto('/dashboard')

    await page.getByLabel('Brand Name').fill('Acme Corp')
    await page.getByPlaceholder(/What are the best options/).fill('How do I sell my annuity?')
    await page.getByRole('button', { name: 'Add' }).first().click()

    const btn = page.getByRole('button', { name: /Run Analysis/ })
    await expect(btn).toBeEnabled()
    await expect(btn).toContainText('1 prompt')
  })
})

// ─────────────────────────────────────────────
// Running state: banner appears
// ─────────────────────────────────────────────

test.describe('Prompt Editor: running state', () => {
  test('shows "Analysis in progress..." when run is active', async ({ page }) => {
    await page.route('/api/runs/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'running', job_id: 'test-job' }),
      })
    })
    await page.route('/api/runs/test-job/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'running' }),
      })
    })
    await page.goto('/dashboard')
    await expect(page.getByText('Analysis in progress...')).toBeVisible()
  })
})
