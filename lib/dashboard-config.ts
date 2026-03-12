export interface ProductLineCard {
  name: string          // raw key from config (e.g. "structured_settlements")
  displayName: string   // humanized (e.g. "Structured Settlements")
  competitors: string[] // full competitor name list
  claimsCount: number   // count of claims for this product line
  isSkipped: boolean    // true if in skipped_product_lines
}

function humanizeKey(key: string): string {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function parseDashboardConfig(config: any): ProductLineCard[] {
  const competitors: Record<string, string[]> = config.competitors ?? {}
  const skipped: string[] = config.skipped_product_lines ?? []
  const claims = config.claims ?? {}

  return Object.keys(competitors).map((key) => {
    const displayName = key === 'brand'
      ? (config.brand_name ?? 'Brand')
      : humanizeKey(key)

    const claimsCount = key === 'brand'
      ? (claims.brand?.length ?? 0)
      : (claims[key]?.length ?? claims.products?.[key]?.length ?? 0)

    return {
      name: key,
      displayName,
      competitors: competitors[key] ?? [],
      claimsCount,
      isSkipped: skipped.includes(key),
    }
  })
}
