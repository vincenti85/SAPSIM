export type StartingBalances = {
  cash: number
  accountsReceivable: number
  inventory: number
  fixedAssets: number
  accountsPayable: number
  debt: number
  equity: number
}

export type ScenarioAssumptions = {
  monthlyVolume: number
  unitPrice: number
  monthlyGrowthRate: number
  cogsPercent: number
  payroll: number
  operatingExpense: number
  capex: number
  dsoDays: number
  dpoDays: number
}

export type ProjectionMonth = {
  month: string
  profitAndLoss: {
    revenue: number
    cogs: number
    grossProfit: number
    payroll: number
    operatingExpense: number
    depreciation: number
    netIncome: number
  }
  balanceSheet: StartingBalances
  cashFlow: {
    netIncome: number
    depreciation: number
    changeInAccountsReceivable: number
    changeInAccountsPayable: number
    capitalExpenditure: number
    netCashMovement: number
    endingCash: number
  }
}

export type ProjectionResult = {
  engineVersion: string
  assumptions: ScenarioAssumptions
  months: ProjectionMonth[]
  checks: Array<{
    month: string
    balanceDifference: number
    balanceSheetBalanced: boolean
    cashFlowReconciled: boolean
  }>
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function monthAt(startMonth: string, offset: number): string {
  const [year, month] = startMonth.split('-').map(Number)
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('startMonth must be YYYY-MM')
  }
  const date = new Date(Date.UTC(year, month - 1 + offset, 1))
  return date.toISOString().slice(0, 7)
}

function validateInput(input: ProjectScenarioInput): void {
  const numericValues = [
    ...Object.values(input.startingBalances),
    ...Object.values(input.assumptions),
    input.months,
  ]
  if (numericValues.some(value => !Number.isFinite(value))) {
    throw new Error('Scenario inputs must be finite numbers')
  }
  if (!Number.isInteger(input.months) || input.months < 1 || input.months > 60) {
    throw new Error('Projection months must be an integer between 1 and 60')
  }
  if (input.assumptions.cogsPercent < 0 || input.assumptions.cogsPercent > 1) {
    throw new Error('COGS percent must be between 0 and 1')
  }
  if (input.assumptions.monthlyVolume < 0 || input.assumptions.unitPrice < 0) {
    throw new Error('Volume and price cannot be negative')
  }
  const opening = input.startingBalances
  const assets = opening.cash + opening.accountsReceivable + opening.inventory + opening.fixedAssets
  const liabilitiesAndEquity = opening.accountsPayable + opening.debt + opening.equity
  if (Math.abs(assets - liabilitiesAndEquity) > 0.01) {
    throw new Error('Starting balance sheet is not balanced')
  }
}

export type ProjectScenarioInput = {
  startingBalances: StartingBalances
  assumptions: ScenarioAssumptions
  months: number
  startMonth: string
  engineVersion: string
}

export function projectScenario(input: ProjectScenarioInput): ProjectionResult {
  validateInput(input)
  let previous = { ...input.startingBalances }
  const months: ProjectionMonth[] = []

  for (let index = 0; index < input.months; index += 1) {
    const growthFactor = (1 + input.assumptions.monthlyGrowthRate) ** index
    const revenue = round(
      input.assumptions.monthlyVolume * input.assumptions.unitPrice * growthFactor,
    )
    const cogs = round(revenue * input.assumptions.cogsPercent)
    const depreciation = round((previous.fixedAssets + input.assumptions.capex) / 60)
    const netIncome = round(
      revenue -
      cogs -
      input.assumptions.payroll -
      input.assumptions.operatingExpense -
      depreciation,
    )
    const accountsReceivable = round(revenue * input.assumptions.dsoDays / 30)
    const accountsPayable = round(cogs * input.assumptions.dpoDays / 30)
    const changeInAccountsReceivable = round(accountsReceivable - previous.accountsReceivable)
    const changeInAccountsPayable = round(accountsPayable - previous.accountsPayable)
    const netCashMovement = round(
      netIncome +
      depreciation -
      changeInAccountsReceivable +
      changeInAccountsPayable -
      input.assumptions.capex,
    )
    const cash = round(previous.cash + netCashMovement)
    const fixedAssets = round(previous.fixedAssets + input.assumptions.capex - depreciation)
    const equity = round(previous.equity + netIncome)
    const balanceSheet: StartingBalances = {
      cash,
      accountsReceivable,
      inventory: previous.inventory,
      fixedAssets,
      accountsPayable,
      debt: previous.debt,
      equity,
    }

    months.push({
      month: monthAt(input.startMonth, index),
      profitAndLoss: {
        revenue,
        cogs,
        grossProfit: round(revenue - cogs),
        payroll: input.assumptions.payroll,
        operatingExpense: input.assumptions.operatingExpense,
        depreciation,
        netIncome,
      },
      balanceSheet,
      cashFlow: {
        netIncome,
        depreciation,
        changeInAccountsReceivable,
        changeInAccountsPayable,
        capitalExpenditure: input.assumptions.capex,
        netCashMovement,
        endingCash: cash,
      },
    })
    previous = balanceSheet
  }

  const checks = months.map(month => {
    const balanceSheet = month.balanceSheet
    const assets = round(
      balanceSheet.cash +
      balanceSheet.accountsReceivable +
      balanceSheet.inventory +
      balanceSheet.fixedAssets,
    )
    const liabilitiesAndEquity = round(
      balanceSheet.accountsPayable + balanceSheet.debt + balanceSheet.equity,
    )
    const balanceDifference = round(assets - liabilitiesAndEquity)
    return {
      month: month.month,
      balanceDifference,
      balanceSheetBalanced: Math.abs(balanceDifference) <= 0.01,
      cashFlowReconciled: Math.abs(month.cashFlow.endingCash - balanceSheet.cash) <= 0.01,
    }
  })

  return {
    engineVersion: input.engineVersion,
    assumptions: { ...input.assumptions },
    months,
    checks,
  }
}

export function compareScenarios(
  baseline: ProjectionResult,
  candidate: ProjectionResult,
): {
  revenueImpact: number
  netIncomeImpact: number
  accountsReceivableImpact: number
  endingCashImpact: number
} {
  const baselineMonth = baseline.months.at(-1)
  const candidateMonth = candidate.months.at(-1)
  if (!baselineMonth || !candidateMonth) {
    throw new Error('Both scenarios must contain projection months')
  }
  return {
    revenueImpact: round(candidateMonth.profitAndLoss.revenue - baselineMonth.profitAndLoss.revenue),
    netIncomeImpact: round(candidateMonth.profitAndLoss.netIncome - baselineMonth.profitAndLoss.netIncome),
    accountsReceivableImpact: round(
      candidateMonth.balanceSheet.accountsReceivable -
      baselineMonth.balanceSheet.accountsReceivable,
    ),
    endingCashImpact: round(
      candidateMonth.cashFlow.endingCash - baselineMonth.cashFlow.endingCash,
    ),
  }
}
