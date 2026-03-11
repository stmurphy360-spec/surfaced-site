/**
 * Tests for parseDashboardConfig
 * Run with: npx tsx lib/__tests__/dashboard-config.test.ts
 */
import assert from 'node:assert/strict'
import { parseDashboardConfig } from '../dashboard-config'

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  PASS: ${name}`)
    passed++
  } catch (err: any) {
    console.error(`  FAIL: ${name}`)
    console.error(`    ${err.message}`)
    failed++
  }
}

console.log('\ndashboard-config tests\n')

// Test 1: basic product line card
test('returns array with one ProductLineCard for a single product line', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: { loans: ['X'] },
    claims: { brand: ['c1'], products: { loans: ['c2'] } },
    skipped_product_lines: [],
  })
  assert.equal(result.length, 1)
  assert.equal(result[0].name, 'loans')
  assert.equal(result[0].displayName, 'Loans')
  assert.deepEqual(result[0].competitors, ['X'])
  assert.equal(result[0].claimsCount, 1)
  assert.equal(result[0].isSkipped, false)
})

// Test 2: skipped product line
test('returns card with isSkipped: true when in skipped_product_lines', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: { loans: ['X'] },
    claims: { brand: [], products: { loans: ['c1', 'c2'] } },
    skipped_product_lines: ['loans'],
  })
  assert.equal(result.length, 1)
  assert.equal(result[0].isSkipped, true)
})

// Test 3: brand-level card when no product-level competitors
test('returns brand-level card using brand_name as displayName when only brand competitors', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: { brand: ['CompA', 'CompB'] },
    claims: { brand: ['claim1', 'claim2', 'claim3'], products: {} },
    skipped_product_lines: [],
  })
  assert.equal(result.length, 1)
  assert.equal(result[0].name, 'brand')
  assert.equal(result[0].displayName, 'Acme')
  assert.deepEqual(result[0].competitors, ['CompA', 'CompB'])
  assert.equal(result[0].claimsCount, 3)
  assert.equal(result[0].isSkipped, false)
})

// Test 4: brand key returns single card for brand
test('brand key in competitors uses brand_name as displayName', () => {
  const result = parseDashboardConfig({
    brand_name: 'JG Wentworth',
    competitors: { brand: ['Rival Co'] },
    claims: { brand: ['b1'], products: {} },
    skipped_product_lines: [],
  })
  assert.equal(result[0].name, 'brand')
  assert.equal(result[0].displayName, 'JG Wentworth')
})

// Test 5: empty competitors returns empty array
test('empty competitors object returns empty array', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: {},
    claims: { brand: [], products: {} },
    skipped_product_lines: [],
  })
  assert.equal(result.length, 0)
})

// Test 6: order preservation
test('product lines maintain input order (Object.keys order)', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: {
      structured_settlements: ['A'],
      annuity_payments: ['B'],
      lottery: ['C'],
    },
    claims: {
      brand: [],
      products: {
        structured_settlements: ['x'],
        annuity_payments: ['y', 'z'],
        lottery: [],
      },
    },
    skipped_product_lines: [],
  })
  assert.equal(result.length, 3)
  assert.equal(result[0].name, 'structured_settlements')
  assert.equal(result[0].displayName, 'Structured Settlements')
  assert.equal(result[1].name, 'annuity_payments')
  assert.equal(result[1].displayName, 'Annuity Payments')
  assert.equal(result[2].name, 'lottery')
  assert.equal(result[2].displayName, 'Lottery')
  // Claims counts
  assert.equal(result[0].claimsCount, 1)
  assert.equal(result[1].claimsCount, 2)
  assert.equal(result[2].claimsCount, 0)
})

// Test 7: missing claims gracefully handled
test('missing claims.products entry returns claimsCount of 0', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: { loans: ['X'] },
    claims: { brand: [], products: {} },
    skipped_product_lines: [],
  })
  assert.equal(result[0].claimsCount, 0)
})

// Test 8: missing skipped_product_lines field
test('missing skipped_product_lines field defaults to not skipped', () => {
  const result = parseDashboardConfig({
    brand_name: 'Acme',
    competitors: { loans: ['X'] },
    claims: { brand: [], products: {} },
  })
  assert.equal(result[0].isSkipped, false)
})

console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
