// Wave 0: These tests define the TEST-03 subscribe flow contract.
// Run: npx playwright test tests/subscribe.spec.ts (dev server must be on localhost:3000)

import { test, expect } from '@playwright/test'

test.describe('TEST-03: subscribe flow', () => {
  test('form success state replaces form inline after valid submit', async ({ page }) => {
    // Mock /api/subscribe before page loads so the route is registered when fetch fires
    await page.route('/api/subscribe', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="company"]', 'Acme Corp')
    await page.click('button[type="submit"]')

    await expect(page.getByTestId('section-cta').locator('form')).not.toBeVisible()
    await expect(page.getByText("You're on the list", { exact: false })).toBeVisible()
  })

  test('error state shows message and retains field values on 500 response', async ({ page }) => {
    // Mock /api/subscribe to return 500 before page loads
    await page.route('/api/subscribe', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      })
    })

    await page.goto('/')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="company"]', 'Acme Corp')
    await page.click('button[type="submit"]')

    // Form must remain visible (not replaced by success state)
    await expect(page.getByTestId('section-cta').locator('form')).toBeVisible()
    // Error message must appear
    await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible()
    // Email field value must be retained
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com')
  })

  test('silent dedup: duplicate submit shows success state (409 handled server-side)', async ({ page }) => {
    // 409 is handled server-side and exposed as success to the client — mock returns success
    await page.route('/api/subscribe', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="company"]', 'Acme Corp')
    await page.click('button[type="submit"]')

    await expect(page.getByTestId('section-cta').locator('form')).not.toBeVisible()
    await expect(page.getByText("You're on the list", { exact: false })).toBeVisible()
  })
})
