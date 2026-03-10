import { test, expect } from '@playwright/test'

test.describe('TEST-02: mobile layout — Pixel 5 (393×851)', () => {
  test.use({ viewport: { width: 393, height: 851 } })

  test('no horizontal scroll on Pixel 5', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('CTA section visible with form on Pixel 5', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /The brands that understand their AI presence in 2026/i })
    ).toBeVisible()
    await expect(
      page.getByTestId('section-cta').locator('input[name="email"]')
    ).toBeVisible()
  })
})

test.describe('TEST-02: mobile layout — iPhone 12 (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('no horizontal scroll on iPhone 12', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('CTA section visible with form on iPhone 12', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /The brands that understand their AI presence in 2026/i })
    ).toBeVisible()
    await expect(
      page.getByTestId('section-cta').locator('input[name="email"]')
    ).toBeVisible()
  })
})
