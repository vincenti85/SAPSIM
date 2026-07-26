import { describe, expect, it } from 'vitest'
import { compareScenarios, projectScenario } from './project-scenario'

describe('projectScenario', () => {
  it('projects revenue from volume and price while keeping every statement balanced', () => {
    const result = projectScenario({
      startingBalances: {
        cash: 500,
        accountsReceivable: 100,
        inventory: 200,
        fixedAssets: 700,
        accountsPayable: 150,
        debt: 350,
        equity: 1000,
      },
      assumptions: {
        monthlyVolume: 100,
        unitPrice: 10,
        monthlyGrowthRate: 0,
        cogsPercent: 0.6,
        payroll: 100,
        operatingExpense: 50,
        capex: 20,
        dsoDays: 30,
        dpoDays: 30,
      },
      months: 2,
      startMonth: '2026-08',
      engineVersion: '1.0.0',
    })

    expect(result.months[0].profitAndLoss.revenue).toBe(1000)
    expect(result.checks.every(check => check.balanceSheetBalanced)).toBe(true)
    expect(result.checks.every(check => check.cashFlowReconciled)).toBe(true)
  })

  it('shows the working-capital impact when DSO increases', () => {
    const startingBalances = {
      cash: 500,
      accountsReceivable: 100,
      inventory: 200,
      fixedAssets: 700,
      accountsPayable: 150,
      debt: 350,
      equity: 1000,
    }
    const assumptions = {
      monthlyVolume: 100,
      unitPrice: 10,
      monthlyGrowthRate: 0,
      cogsPercent: 0.6,
      payroll: 100,
      operatingExpense: 50,
      capex: 20,
      dsoDays: 30,
      dpoDays: 30,
    }
    const baseline = projectScenario({
      startingBalances,
      assumptions,
      months: 1,
      startMonth: '2026-08',
      engineVersion: '1.0.0',
    })
    const downside = projectScenario({
      startingBalances,
      assumptions: { ...assumptions, dsoDays: 60 },
      months: 1,
      startMonth: '2026-08',
      engineVersion: '1.0.0',
    })

    const bridge = compareScenarios(baseline, downside)

    expect(bridge.revenueImpact).toBe(0)
    expect(bridge.accountsReceivableImpact).toBe(1000)
    expect(bridge.endingCashImpact).toBe(-1000)
  })
})
