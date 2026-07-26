import { describe, expect, it } from 'vitest'
import {
  baselineAssumptions,
  planningDataProfile,
  startingBalances,
} from './planning-data'

describe('planning data profile', () => {
  it('keeps the seeded opening balance sheet balanced', () => {
    const assets =
      startingBalances.cash +
      startingBalances.accountsReceivable +
      startingBalances.inventory +
      startingBalances.fixedAssets
    const liabilitiesAndEquity =
      startingBalances.accountsPayable +
      startingBalances.debt +
      startingBalances.equity

    expect(assets).toBe(liabilitiesAndEquity)
  })

  it('declares the source, period and modeling limits used by Planning Mode', () => {
    expect(planningDataProfile.sourceDetail).toContain('not connected to a live ERP')
    expect(planningDataProfile.projectionStart).toBe('2026-08')
    expect(planningDataProfile.projectionMonths).toBe(12)
    expect(planningDataProfile.formulas).toHaveLength(4)
    expect(planningDataProfile.limitations.length).toBeGreaterThanOrEqual(3)
    expect(baselineAssumptions.dsoDays).toBe(30)
  })
})
