import { test, expect } from '@playwright/test'

test.describe('TEST-01: major section coverage (desktop)', () => {
  test('all major sections are visible', async ({ page }) => {
    await page.goto('/')

    // Hero section
    await expect(
      page.getByRole('heading', { name: /Finally know what AI says about your brand/i })
    ).toBeVisible()

    // Dashboard preview section — no heading element; assert section label text
    await expect(
      page.getByText(/Weekly report/i, { exact: false })
    ).toBeVisible()

    // Three Dimensions section
    await expect(
      page.getByRole('heading', { name: /What we measure/i })
    ).toBeVisible()

    // Methodology section
    await expect(
      page.getByRole('heading', { name: /How we measure it/i })
    ).toBeVisible()

    // CTA section
    await expect(
      page.getByRole('heading', { name: /The brands that understand their AI presence in 2026/i })
    ).toBeVisible()
  })
})

test.describe('TEST-02: mobile layout at 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('all major sections visible at mobile', async ({ page }) => {
    await page.goto('/')

    // Hero section
    await expect(
      page.getByRole('heading', { name: /Finally know what AI says about your brand/i })
    ).toBeVisible()

    // Dashboard preview section
    await expect(
      page.getByText(/Weekly report/i, { exact: false })
    ).toBeVisible()

    // Three Dimensions section
    await expect(
      page.getByRole('heading', { name: /What we measure/i })
    ).toBeVisible()

    // Methodology section
    await expect(
      page.getByRole('heading', { name: /How we measure it/i })
    ).toBeVisible()

    // CTA section
    await expect(
      page.getByRole('heading', { name: /The brands that understand their AI presence in 2026/i })
    ).toBeVisible()
  })

  test('CTA form is tappable at mobile', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByTestId('section-cta').locator('input[name="email"]')
    ).toBeVisible()
  })
})
