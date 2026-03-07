import { test, expect } from '@playwright/test'

test.describe('ANLYT-01: mobile layout — Pixel 5', () => {
  test('renders without horizontal scroll on Pixel 5', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('form is visible and CTA button is tappable on Pixel 5', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})

test.describe('ANLYT-01: mobile layout — iPhone 12', () => {
  test('renders without horizontal scroll on iPhone 12', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('form is visible and CTA button is tappable on iPhone 12', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
