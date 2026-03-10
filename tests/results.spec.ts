// Wave 0: Defines RPTD-03 top bar visual contract. Tests 1-5 FAIL against current page.tsx. Run: cd /Users/smurph/surfaced-site && npx playwright test tests/results.spec.ts --project chromium

import { test, expect } from '@playwright/test'

test.describe('RPTD-03: Results page top bar chrome', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the /runs endpoint so the server component can compute the sequence number
    await page.route('**/runs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ run_ids: ['run_20260310_120000'] }),
      })
    })
    await page.goto('/dashboard/results/run_20260310_120000')
  })

  test('1. Top bar background is white, not cream', async ({ page }) => {
    const topBar = page.locator('.shrink-0').first()
    // FAILS against current page.tsx (current class is bg-cream)
    await expect(topBar).not.toHaveClass(/bg-cream/)
    await expect(topBar).toHaveClass(/bg-white/)
  })

  test('2. Run label is visible and legible', async ({ page }) => {
    // The label span is the second child inside the top bar left group
    const label = page.locator('.shrink-0 span').first()
    await expect(label).toBeVisible()
    // FAILS against current page.tsx (current class is text-ink/40, very faint)
    await expect(label).not.toHaveClass(/text-ink\/40/)
    await expect(label).toHaveClass(/text-ink/)
  })

  test('3. Back link uses subtle token', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Dashboard/ })
    await expect(backLink).toBeVisible()
    // FAILS against current page.tsx (current class is text-ink/60)
    // Use word-boundary pattern to avoid matching "hover:text-ink"
    await expect(backLink).not.toHaveClass(/(?<![:\w])text-ink(?![\/\w-])/)
    await expect(backLink).toHaveClass(/text-subtle/)
  })

  test('4. Download button text is white, not cream', async ({ page }) => {
    const downloadBtn = page.getByRole('link', { name: /Download CSVs/ })
    await expect(downloadBtn).toBeVisible()
    // FAILS against current page.tsx (current class is text-cream)
    await expect(downloadBtn).not.toHaveClass(/text-cream/)
    await expect(downloadBtn).toHaveClass(/text-white/)
  })

  test('5. iframe is present and unmodified (smoke test)', async ({ page }) => {
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible()
    // iframe should have no bg-cream or dark classes (these pass before and after the styling change)
    await expect(iframe).not.toHaveClass(/bg-cream/)
    await expect(iframe).not.toHaveClass(/dark:/)
  })

  test('6. No dark-mode classes on top bar', async ({ page }) => {
    const darkElements = page.locator('[class*="dark:"]')
    await expect(darkElements).toHaveCount(0)
  })
})
