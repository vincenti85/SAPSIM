import { describe, expect, it } from 'vitest'
import { ScenarioBook } from './scenario-book'

describe('ScenarioBook', () => {
  it('keeps published assumptions immutable and creates editable clones with lineage', () => {
    const book = new ScenarioBook()
    const baseline = book.create({
      name: 'FY27 Baseline',
      assumptions: { dsoDays: 30, monthlyVolume: 12_500 },
      createdBy: 'analyst-1',
    })
    book.publish(baseline.id, 'manager-1')

    expect(() =>
      book.updateAssumptions(baseline.id, { dsoDays: 45 }),
    ).toThrow('Published scenarios are immutable')

    const downside = book.clone(baseline.id, {
      name: 'Collection slowdown',
      createdBy: 'analyst-1',
    })
    book.updateAssumptions(downside.id, { dsoDays: 60 })

    expect(downside.parentVersionId).toBe(baseline.id)
    expect(book.get(downside.id).assumptions).toMatchObject({
      dsoDays: 60,
      monthlyVolume: 12_500,
    })
  })
})
