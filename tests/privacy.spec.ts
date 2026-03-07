import { test, expect } from '@playwright/test'

test.describe('ANLYT-01: privacy page', () => {
  test('/privacy page renders with correct heading', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1')).toContainText('Privacy Policy')
  })

  test('/privacy page contains policy paragraph', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('main p').first()).toBeVisible()
  })

  test('/privacy page has a back-to-home link', async ({ page }) => {
    await page.goto('/privacy')
    const homeLink = page.locator('a[href="/"]')
    await expect(homeLink).toBeVisible()
  })
})

test.describe('ANLYT-01: privacy disclaimer on homepage', () => {
  test('privacy disclaimer link is visible below the form', async ({ page }) => {
    await page.goto('/')
    const privacyLink = page.locator('a[href="/privacy"]')
    await expect(privacyLink).toBeVisible()
  })
})
