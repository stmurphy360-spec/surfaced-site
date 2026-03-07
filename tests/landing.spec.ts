import { test, expect } from '@playwright/test'

test.describe('LAND-04: mobile responsive', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('renders without horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })
})

test.describe('LAND-05: single CTA discipline', () => {
  test('has exactly one submit button with correct text', async ({ page }) => {
    await page.goto('/')
    const ctaButtons = page.locator('button[type="submit"]')
    await expect(ctaButtons).toHaveCount(1)
    await expect(ctaButtons).toContainText('Get early access')
  })

  test('has no nav links', async ({ page }) => {
    await page.goto('/')
    const navLinks = page.locator('nav a')
    await expect(navLinks).toHaveCount(0)
  })

  test('has no external links', async ({ page }) => {
    await page.goto('/')
    const externalLinks = page.locator('a[href^="http"]')
    await expect(externalLinks).toHaveCount(0)
  })

  test('form success state replaces form inline after valid submit', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="company"]', 'ACME Corp')
    await page.click('button[type="submit"]')
    await expect(page.locator('form')).not.toBeVisible()
    await expect(page.getByText("You're on the list")).toBeVisible()
  })
})
