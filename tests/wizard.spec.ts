// Wave 0: Wizard e2e test stubs — WIZ-01 through WIZ-05
// These MUST fail until wizard implementation is complete.
// Run: cd /Users/smurph/surfaced-site && npx playwright test tests/wizard.spec.ts --project chromium
// Dev server must be running at localhost:3000.

import { test, expect } from '@playwright/test'

// Mock helpers
async function mockNoConfig(page: import('@playwright/test').Page) {
  await page.route('/api/config', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ brand_name: '' }),
    })
  })
}

async function mockExistingConfig(page: import('@playwright/test').Page) {
  await page.route('/api/config', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ brand_name: 'Acme Corp', competitors: {}, claims: {} }),
    })
  })
}

// WIZ-01: 6-step wizard renders, step 1 shows brand name input
test.describe('WIZ-01: step 1 brand name', () => {
  test('wizard renders step 1 with brand name input', async ({ page }) => {
    await mockNoConfig(page)
    await page.goto('/wizard')
    // FAILS: /wizard route does not exist yet
    await expect(page.getByText('Step 1 of 6')).toBeVisible()
    await expect(page.getByPlaceholder(/brand name/i)).toBeVisible()
  })
})

// WIZ-02: Completing wizard writes valid config and redirects to /dashboard
test.describe('WIZ-02: completion', () => {
  test('completing wizard redirects to /dashboard', async ({ page }) => {
    await mockNoConfig(page)
    await page.goto('/wizard')
    // FAILS: /wizard route does not exist yet
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 })
  })
})

// WIZ-03: Claims step shows brand section + per-product sections
test.describe('WIZ-03: claims', () => {
  test('claims step renders brand section and per-product sections', async ({ page }) => {
    await mockNoConfig(page)
    await page.goto('/wizard')
    // Step 1: enter brand and continue
    await page.getByPlaceholder(/brand name/i).fill('Test Brand')
    await page.getByRole('button', { name: 'Continue' }).click()
    // Step 2: skip products, continue to step 3
    await page.getByRole('button', { name: 'Continue' }).click()
    // Step 3: claims step should show Brand Messaging section
    await expect(page.getByText('Brand Messaging')).toBeVisible()
  })
})

// WIZ-04: Wizard is skipped when config.brand_name already exists
test.describe('WIZ-04: bypass', () => {
  test('wizard bypasses to dashboard when brand_name is set', async ({ page }) => {
    await mockExistingConfig(page)
    await page.goto('/wizard')
    // FAILS: /wizard route does not exist yet
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
  })
})

// WIZ-05: Wizard renders with light gray background (#f8f9fb)
test.describe('WIZ-05: light mode', () => {
  test('wizard renders with #f8f9fb background, not cream and not dark', async ({ page }) => {
    await mockNoConfig(page)
    await page.goto('/wizard')
    // FAILS: /wizard route does not exist yet
    const bgColor = await page.evaluate(() => {
      const el = document.querySelector('.wizard-root') as HTMLElement
      if (!el) return null
      return window.getComputedStyle(el).getPropertyValue('--wiz-bg').trim()
    })
    expect(bgColor).toBe('#f8f9fb')
  })
})
