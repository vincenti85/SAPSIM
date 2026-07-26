import type {
  ScenarioAssumptions,
  StartingBalances,
} from './project-scenario'

export const startingBalances: StartingBalances = {
  cash: 1_850_000,
  accountsReceivable: 1_000_000,
  inventory: 1_400_000,
  fixedAssets: 5_750_000,
  accountsPayable: 1_100_000,
  debt: 2_900_000,
  equity: 6_000_000,
}

export const baselineAssumptions: ScenarioAssumptions = {
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

export const planningDataProfile = {
  datasetId: 'demo-abc-auto-parts-fy27-v1',
  sourceLabel: 'Illustrative seeded dataset',
  sourceDetail: 'Training assumptions for ABC Auto Parts Inc.; not connected to a live ERP or external market feed.',
  asOfDate: '2026-07-31',
  projectionStart: '2026-08',
  projectionMonths: 12,
  currency: 'USD',
  engineVersion: '1.1.0',
  formulas: [
    'Revenue = monthly volume × unit price × monthly growth',
    'Accounts receivable = revenue × DSO ÷ 30',
    'Accounts payable = COGS × DPO ÷ 30',
    'Ending cash = opening cash + net income + depreciation − working capital changes − CapEx',
  ],
  limitations: [
    'Inventory, debt and tax movements are held constant.',
    'No seasonality, financing events or probability weighting is applied.',
    'Results are educational estimates and must not be used as financial advice.',
  ],
} as const
