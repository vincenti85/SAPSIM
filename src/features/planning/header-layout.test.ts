import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const simulatorHtml = readFileSync(
  join(process.cwd(), 'erp-simulator.html'),
  'utf8',
)

describe('ERP simulator header actions', () => {
  it('keeps the FP&A Planning Lab link in the responsive header flow', () => {
    expect(simulatorHtml).not.toContain('id="planning-lab-link"')
    expect(simulatorHtml).not.toMatch(
      /#planning-lab-link\s*\{[^}]*position:\s*fixed/s,
    )

    const learningToolsPosition = simulatorHtml.indexOf(
      '<LearningToolsSwitcher lang={lang} />',
    )
    const planningLinkPosition = simulatorHtml.indexOf('href="/planning"')

    expect(learningToolsPosition).toBeGreaterThan(-1)
    expect(planningLinkPosition).toBeGreaterThan(learningToolsPosition)
    expect(
      simulatorHtml.slice(learningToolsPosition, planningLinkPosition),
    ).toContain('w-px h-5')
  })
})
