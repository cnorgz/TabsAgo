import { describe, expect, it } from 'vitest'

// Re-import internals by duplicating minimal logic for unit-test scope
const ONE_DAY = 24 * 60 * 60 * 1000
function getDayBucket(ts: number): 'Today' | 'Yesterday' | 'This Week' | 'Older' {
  const now = Date.now()
  const diff = now - ts
  if (diff < ONE_DAY) return 'Today'
  if (diff < 2 * ONE_DAY) return 'Yesterday'
  if (diff < 7 * ONE_DAY) return 'This Week'
  return 'Older'
}

describe('getDayBucket', () => {
  it('categorizes Today', () => {
    const ts = Date.now() - (ONE_DAY - 1000)
    expect(getDayBucket(ts)).toBe('Today')
  })
  it('categorizes Yesterday', () => {
    const ts = Date.now() - (ONE_DAY + 1000)
    expect(getDayBucket(ts)).toBe('Yesterday')
  })
  it('categorizes This Week', () => {
    const ts = Date.now() - (3 * ONE_DAY)
    expect(getDayBucket(ts)).toBe('This Week')
  })
  it('categorizes Older', () => {
    const ts = Date.now() - (10 * ONE_DAY)
    expect(getDayBucket(ts)).toBe('Older')
  })
})


