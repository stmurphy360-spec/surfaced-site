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
    const count = await monoElements.count()
    expect(count).toBeGreaterThan(0)
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

test.describe('DIM-01: three dimensions section', () => {
  test('section with id="what-we-measure" is visible on page load', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#what-we-measure')
    await expect(section).toBeVisible()
  })

  test('section contains all three dimension names', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#what-we-measure')
    await expect(section.getByRole('heading', { name: 'Visibility' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Sentiment' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Message Match' })).toBeVisible()
  })
})

test.describe('DIM-02: dimension card data examples', () => {
  test('Visibility card shows badge with visibility label', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#what-we-measure')
    const visibilityBadge = section.getByText(/visibility/i).first()
    await expect(visibilityBadge).toBeVisible()
  })

  test('Sentiment card shows badge with sentiment label', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#what-we-measure')
    const sentimentBadge = section.getByText(/sentiment/i).first()
    await expect(sentimentBadge).toBeVisible()
  })

  test('Message Match card shows badge with message match label', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#what-we-measure')
    const messageMatchBadge = section.getByText(/message match/i).first()
    await expect(messageMatchBadge).toBeVisible()
  })

  test('each dimension card contains a data example element', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#what-we-measure')
    const dataExamples = section.locator('[data-testid="dimension-example"], .font-mono')
    const count = await dataExamples.count()
    expect(count).toBeGreaterThan(0)
  })
})

// Task 2 implementation note:
// - Methodology section must have id="how-it-works"
// - Stat block must contain text "5×3" and "15"
// - Prompt log container: data-testid="prompt-log"
// - Each prompt row: data-testid="prompt-row" (exactly 5)

test.describe('METH-01: stat block', () => {
  test('section with id="how-it-works" is visible on page load', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#how-it-works')
    await expect(section).toBeVisible()
  })

  test('stat block contains text "5×3"', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#how-it-works')
    await expect(section.getByText('5×3')).toBeVisible()
  })

  test('stat block contains text "15"', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#how-it-works')
    await expect(section.getByText('15')).toBeVisible()
  })
})

test.describe('METH-02: prompt log illustration', () => {
  test('prompt log illustration element is visible', async ({ page }) => {
    await page.goto('/')
    const promptLog = page.locator('[data-testid="prompt-log"]')
    await expect(promptLog).toBeVisible()
  })

  test('prompt log shows exactly 5 prompt rows', async ({ page }) => {
    await page.goto('/')
    const promptRows = page.locator('[data-testid="prompt-row"]')
    await expect(promptRows).toHaveCount(5)
  })
})
