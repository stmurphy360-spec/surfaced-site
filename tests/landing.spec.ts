import { test, expect } from '@playwright/test'

test.describe('LAND-04: mobile responsive', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('renders without horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('renders without horizontal scroll at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('renders without horizontal scroll at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
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

  test('has no external links', async ({ page }) => {
    await page.goto('/')
    const externalLinks = page.locator('a[href^="http"]')
    await expect(externalLinks).toHaveCount(0)
  })

  test('privacy disclaimer link is an internal relative link', async ({ page }) => {
    await page.goto('/')
    const privacyLink = page.locator('a[href="/privacy"]')
    await expect(privacyLink).toHaveCount(1)
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

test.describe('DSGN-01: design system tokens', () => {
  test('design system: body has white background', async ({ page }) => {
    await page.goto('/')
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    // Accept rgb(255, 255, 255) or rgba(255, 255, 255, 1)
    expect(bgColor.toLowerCase()).toMatch(/rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*1\)/)
  })

  test('design system: ocean accent token resolves to #2563eb', async ({ page }) => {
    await page.goto('/')
    const oceanToken = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-ocean').trim()
    )
    expect(oceanToken).toBe('#2563eb')
  })
})

test.describe('DSGN-02: fonts', () => {
  test('fonts: Inter loaded as body font', async ({ page }) => {
    await page.goto('/')
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(fontFamily.toLowerCase()).toContain('inter')
  })

  test('fonts: JetBrains Mono applied to mono element', async ({ page }) => {
    await page.goto('/')
    const monoElements = page.locator('.font-mono')
    await expect(monoElements).toHaveCount(1)
    const fontFamily = await monoElements.first().evaluate((el) =>
      getComputedStyle(el).fontFamily
    )
    expect(fontFamily.toLowerCase()).toContain('jetbrains')
  })
})

test.describe('NAV-01: nav links', () => {
  test('nav: has logo and three anchor links', async ({ page }) => {
    await page.goto('/')
    const navLinks = page.locator('nav a')
    await expect(navLinks).toHaveCount(4)
    const hrefs = await navLinks.evaluateAll((links) =>
      links.map((l) => (l as HTMLAnchorElement).getAttribute('href'))
    )
    expect(hrefs).toContain('#methodology')
    expect(hrefs).toContain('#dimensions')
    expect(hrefs).toContain('#cta')
  })

  test('nav: mobile hamburger visible at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const hamburger = page.locator('[data-testid="hamburger"], button[aria-label="Open menu"]')
    await expect(hamburger).toBeVisible()
  })
})

test.describe('NAV-02: footer links', () => {
  test('footer: has logo and three links', async ({ page }) => {
    await page.goto('/')
    const privacyLink = page.locator('footer a[href="/privacy"]')
    await expect(privacyLink).toHaveCount(1)
    const termsLink = page.locator('footer a[href="/terms"]')
    await expect(termsLink).toHaveCount(1)
    const ctaLink = page.locator('footer a[href="#cta"]')
    await expect(ctaLink).toHaveCount(1)
  })
})
