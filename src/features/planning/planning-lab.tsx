import { useMemo, useState } from 'react'
import {
  compareScenarios,
  projectScenario,
  type ScenarioAssumptions,
} from '../../domain/planning/project-scenario'

const startingBalances = {
  cash: 1_850_000,
  accountsReceivable: 1_000_000,
  inventory: 1_400_000,
  fixedAssets: 5_750_000,
  accountsPayable: 1_100_000,
  debt: 2_900_000,
  equity: 6_000_000,
}

const baselineAssumptions: ScenarioAssumptions = {
  monthlyVolume: 12_500,
  unitPrice: 240,
  monthlyGrowthRate: 0.01,
  cogsPercent: 0.58,
  payroll: 420_000,
  operatingExpense: 310_000,
  capex: 120_000,
  dsoDays: 30,
  dpoDays: 35,
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

type DriverKey = 'monthlyVolume' | 'unitPrice' | 'cogsPercent' | 'dsoDays' | 'capex'

const drivers: Array<{
  key: DriverKey
  label: string
  min: number
  max: number
  step: number
  format: (value: number) => string
}> = [
  { key: 'monthlyVolume', label: 'Monthly volume', min: 7000, max: 16000, step: 100, format: value => value.toLocaleString() },
  { key: 'unitPrice', label: 'Unit price', min: 180, max: 290, step: 1, format: value => `$${value}` },
  { key: 'cogsPercent', label: 'COGS ratio', min: 0.45, max: 0.75, step: 0.01, format: value => `${Math.round(value * 100)}%` },
  { key: 'dsoDays', label: 'Days sales outstanding', min: 15, max: 90, step: 1, format: value => `${value} days` },
  { key: 'capex', label: 'Monthly CapEx', min: 0, max: 350000, step: 10000, format: value => currency.format(value) },
]

function Metric({ label, value, impact }: { label: string; value: string; impact?: number }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {impact !== undefined && (
        <small className={impact < 0 ? 'negative' : impact > 0 ? 'positive' : ''}>
          {impact > 0 ? '+' : ''}{currency.format(impact)} vs baseline
        </small>
      )}
    </article>
  )
}

export function PlanningLab() {
  const [assumptions, setAssumptions] = useState<ScenarioAssumptions>({
    ...baselineAssumptions,
    monthlyVolume: 10_500,
    dsoDays: 52,
    capex: 80_000,
  })

  const baseline = useMemo(() => projectScenario({
    startingBalances,
    assumptions: baselineAssumptions,
    months: 12,
    startMonth: '2026-08',
    engineVersion: '1.0.0',
  }), [])
  const scenario = useMemo(() => projectScenario({
    startingBalances,
    assumptions,
    months: 12,
    startMonth: '2026-08',
    engineVersion: '1.0.0',
  }), [assumptions])
  const bridge = compareScenarios(baseline, scenario)
  const finalMonth = scenario.months.at(-1)!
  const maxRevenue = Math.max(...baseline.months.map(month => month.profitAndLoss.revenue))

  function updateDriver(key: DriverKey, value: number) {
    setAssumptions(current => ({ ...current, [key]: value }))
  }

  return (
    <div className="app-shell">
      <aside>
        <a className="brand" href="/">ERP Learning Lab</a>
        <p className="eyebrow">Planning mode</p>
        <h1>FP&A Scenario Studio</h1>
        <p className="intro">Change operating drivers and trace the impact through P&amp;L, balance sheet and cash flow.</p>

        <div className="driver-list">
          {drivers.map(driver => (
            <label key={driver.key}>
              <span><b>{driver.label}</b><output>{driver.format(assumptions[driver.key])}</output></span>
              <input
                type="range"
                min={driver.min}
                max={driver.max}
                step={driver.step}
                value={assumptions[driver.key]}
                onChange={event => updateDriver(driver.key, Number(event.target.value))}
              />
            </label>
          ))}
        </div>
        <button onClick={() => setAssumptions({ ...baselineAssumptions })}>Reset to baseline</button>
        <p className="disclaimer">Illustrative educational simulation. Not financial advice. Engine v{scenario.engineVersion}.</p>
      </aside>

      <main>
        <header>
          <div>
            <p className="eyebrow">Scenario / Revenue slowdown &amp; inventory pressure</p>
            <h2>12-month operating outlook</h2>
          </div>
          <div className="check">{scenario.checks.every(item => item.balanceSheetBalanced && item.cashFlowReconciled) ? '✓ Statements reconciled' : '⚠ Review required'}</div>
        </header>

        <section className="metrics">
          <Metric label="Month 12 revenue" value={currency.format(finalMonth.profitAndLoss.revenue)} impact={bridge.revenueImpact} />
          <Metric label="Month 12 net income" value={currency.format(finalMonth.profitAndLoss.netIncome)} impact={bridge.netIncomeImpact} />
          <Metric label="Ending cash" value={currency.format(finalMonth.cashFlow.endingCash)} impact={bridge.endingCashImpact} />
          <Metric label="Accounts receivable" value={currency.format(finalMonth.balanceSheet.accountsReceivable)} impact={bridge.accountsReceivableImpact} />
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div><h3>Revenue trajectory</h3><p>Baseline compared with the active downside scenario</p></div>
            <div className="legend"><span className="base-dot" />Baseline <span className="scenario-dot" />Scenario</div>
          </div>
          <div className="chart">
            {scenario.months.map((month, index) => (
              <div className="bar-group" key={month.month}>
                <div className="bars">
                  <i className="base-bar" style={{ height: `${baseline.months[index].profitAndLoss.revenue / maxRevenue * 100}%` }} />
                  <i className="scenario-bar" style={{ height: `${month.profitAndLoss.revenue / maxRevenue * 100}%` }} />
                </div>
                <span>{month.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="statement-grid">
          {[
            ['Profit & Loss', [
              ['Revenue', finalMonth.profitAndLoss.revenue],
              ['Gross profit', finalMonth.profitAndLoss.grossProfit],
              ['Net income', finalMonth.profitAndLoss.netIncome],
            ]],
            ['Balance Sheet', [
              ['Cash', finalMonth.balanceSheet.cash],
              ['Accounts receivable', finalMonth.balanceSheet.accountsReceivable],
              ['Equity', finalMonth.balanceSheet.equity],
            ]],
            ['Cash Flow', [
              ['Net income', finalMonth.cashFlow.netIncome],
              ['Working capital', -finalMonth.cashFlow.changeInAccountsReceivable + finalMonth.cashFlow.changeInAccountsPayable],
              ['Net cash movement', finalMonth.cashFlow.netCashMovement],
            ]],
          ].map(([title, rows]) => (
            <article className="panel statement" key={String(title)}>
              <h3>{String(title)}</h3>
              {(rows as Array<[string, number]>).map(([label, amount]) => (
                <div key={label}><span>{label}</span><b>{currency.format(amount)}</b></div>
              ))}
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
