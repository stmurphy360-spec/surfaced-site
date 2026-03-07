import { test, expect } from '@playwright/test'

test.describe('LAND-04: page load time', () => {
  test('page loads in under 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'load' })
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
  })
})
