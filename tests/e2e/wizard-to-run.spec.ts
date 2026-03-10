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
