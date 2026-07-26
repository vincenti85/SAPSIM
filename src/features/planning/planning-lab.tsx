import { useMemo, useState } from 'react'
import {
  baselineAssumptions,
  planningDataProfile,
  startingBalances,
} from '../../domain/planning/planning-data'
import {
  compareScenarios,
  projectScenario,
  type ScenarioAssumptions,
} from '../../domain/planning/project-scenario'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: planningDataProfile.currency,
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

function ModelGuide() {
  return (
    <aside className="model-guide" aria-labelledby="model-guide-title">
      <div className="guide-heading">
        <div>
          <p className="eyebrow">Planning model guide</p>
          <h3 id="model-guide-title">데이터 출처 및 활용 방법</h3>
        </div>
        <span className="demo-badge">{planningDataProfile.sourceLabel}</span>
      </div>

      <section aria-labelledby="data-source-title">
        <h4 id="data-source-title">1. 데이터 출처</h4>
        <p>{planningDataProfile.sourceDetail}</p>
        <dl className="model-meta">
          <div><dt>Dataset</dt><dd>{planningDataProfile.datasetId}</dd></div>
          <div><dt>기준일</dt><dd>{planningDataProfile.asOfDate}</dd></div>
          <div><dt>전망기간</dt><dd>{planningDataProfile.projectionStart}부터 {planningDataProfile.projectionMonths}개월</dd></div>
          <div><dt>통화</dt><dd>{planningDataProfile.currency}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="usage-title">
        <h4 id="usage-title">2. 활용 순서</h4>
        <ol>
          <li><b>Baseline</b>에서 현재 계획을 확인합니다.</li>
          <li>한 번에 한 개 driver를 조정해 원인을 분리합니다.</li>
          <li>KPI의 <b>vs baseline</b> 차이와 3개 재무제표를 함께 확인합니다.</li>
          <li>가정과 결과를 검토한 뒤 Reset으로 기준안을 복원합니다.</li>
        </ol>
      </section>

      <details>
        <summary>산식·고정 가정·모델 한계 보기</summary>
        <h4>고정 Baseline 가정</h4>
        <dl className="assumption-list">
          <div><dt>Monthly growth</dt><dd>{baselineAssumptions.monthlyGrowthRate * 100}%</dd></div>
          <div><dt>Payroll</dt><dd>{currency.format(baselineAssumptions.payroll)}</dd></div>
          <div><dt>Operating expense</dt><dd>{currency.format(baselineAssumptions.operatingExpense)}</dd></div>
          <div><dt>DPO</dt><dd>{baselineAssumptions.dpoDays} days</dd></div>
        </dl>
        <h4>핵심 산식</h4>
        <ul>{planningDataProfile.formulas.map(formula => <li key={formula}>{formula}</li>)}</ul>
        <h4>모델 한계</h4>
        <ul>{planningDataProfile.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
      </details>
    </aside>
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
    months: planningDataProfile.projectionMonths,
    startMonth: planningDataProfile.projectionStart,
    engineVersion: planningDataProfile.engineVersion,
  }), [])
  const scenario = useMemo(() => projectScenario({
    startingBalances,
    assumptions,
    months: planningDataProfile.projectionMonths,
    startMonth: planningDataProfile.projectionStart,
    engineVersion: planningDataProfile.engineVersion,
  }), [assumptions])
  const bridge = compareScenarios(baseline, scenario)
  const finalMonth = scenario.months.at(-1)!
  const maxRevenue = Math.max(
    ...baseline.months.map(month => month.profitAndLoss.revenue),
    ...scenario.months.map(month => month.profitAndLoss.revenue),
  )
  const reconciled = scenario.checks.every(item => item.balanceSheetBalanced && item.cashFlowReconciled)

  function updateDriver(key: DriverKey, value: number) {
    setAssumptions(current => ({ ...current, [key]: value }))
  }

  return (
    <div className="app-shell">
      <aside className="control-rail">
        <a className="brand" href="/">ERP Learning Lab</a>
        <p className="eyebrow">Planning mode</p>
        <h1>FP&amp;A Scenario Studio</h1>
        <p className="intro">Change operating drivers and trace the impact through P&amp;L, balance sheet and cash flow.</p>

        <div className="driver-list">
          {drivers.map(driver => {
            const inputId = `driver-${driver.key}`
            return (
              <label key={driver.key} htmlFor={inputId}>
                <span>
                  <b>{driver.label}</b>
                  <output htmlFor={inputId}>{driver.format(assumptions[driver.key])}</output>
                </span>
                <input
                  id={inputId}
                  type="range"
                  min={driver.min}
                  max={driver.max}
                  step={driver.step}
                  value={assumptions[driver.key]}
                  onChange={event => updateDriver(driver.key, Number(event.target.value))}
                />
              </label>
            )
          })}
        </div>
        <button onClick={() => setAssumptions({ ...baselineAssumptions })}>Reset to baseline</button>
        <p className="disclaimer">Illustrative educational simulation · {planningDataProfile.currency} · Engine v{scenario.engineVersion}</p>
      </aside>

      <main>
        <div className="content-frame">
          <header>
            <div>
              <p className="eyebrow">Scenario / Revenue slowdown &amp; working-capital pressure</p>
              <h2>12-month operating outlook</h2>
              <p className="period-note">Illustrative data · As of {planningDataProfile.asOfDate} · {planningDataProfile.currency}</p>
            </div>
            <div className={`check ${reconciled ? '' : 'review'}`}>
              {reconciled ? 'Statements reconciled' : 'Review required'}
            </div>
          </header>

          <section className="metrics" aria-label="Scenario summary metrics">
            <Metric label="Month 12 revenue" value={currency.format(finalMonth.profitAndLoss.revenue)} impact={bridge.revenueImpact} />
            <Metric label="Month 12 net income" value={currency.format(finalMonth.profitAndLoss.netIncome)} impact={bridge.netIncomeImpact} />
            <Metric label="Ending cash" value={currency.format(finalMonth.cashFlow.endingCash)} impact={bridge.endingCashImpact} />
            <Metric label="Accounts receivable" value={currency.format(finalMonth.balanceSheet.accountsReceivable)} impact={bridge.accountsReceivableImpact} />
          </section>

          <div className="analysis-grid">
            <section className="panel chart-panel" aria-labelledby="revenue-chart-title">
              <div className="panel-heading">
                <div>
                  <h3 id="revenue-chart-title">Revenue trajectory</h3>
                  <p>Baseline compared with the active downside scenario</p>
                </div>
                <div className="legend" aria-label="Chart legend">
                  <span className="base-dot" />Baseline
                  <span className="scenario-dot" />Scenario
                </div>
              </div>
              <figure>
                <div
                  className="chart"
                  role="img"
                  aria-label={`Monthly revenue comparison. Month 12 baseline ${currency.format(baseline.months.at(-1)!.profitAndLoss.revenue)} and scenario ${currency.format(finalMonth.profitAndLoss.revenue)}.`}
                >
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
                <figcaption>Months run from {planningDataProfile.projectionStart} for {planningDataProfile.projectionMonths} months.</figcaption>
              </figure>
            </section>

            <ModelGuide />
          </div>

          <section className="statement-grid" aria-label="Month 12 financial statements">
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
        </div>
      </main>
    </div>
  )
}
