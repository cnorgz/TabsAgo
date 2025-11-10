import { describe, it, expect } from 'vitest'

import { getRelativeTime } from './timeUtils'

describe('getRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = Date.now()
    expect(getRelativeTime(now)).toBe('just now')
  })
  
  it('returns minutes for < 1 hour', () => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    expect(getRelativeTime(fiveMinutesAgo)).toBe('5m ago')
  })
  
  it('returns hours for < 24 hours', () => {
    const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000)
    expect(getRelativeTime(threeHoursAgo)).toBe('3h ago')
  })
  
  it('returns days for < 7 days', () => {
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000)
    expect(getRelativeTime(twoDaysAgo)).toBe('2d ago')
  })
  
  it('returns weeks for < 30 days', () => {
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000)
    expect(getRelativeTime(twoWeeksAgo)).toBe('2w ago')
  })
  
  it('returns months for > 30 days', () => {
    const twoMonthsAgo = Date.now() - (60 * 24 * 60 * 60 * 1000)
    expect(getRelativeTime(twoMonthsAgo)).toBe('2mo ago')
  })
  
  it('handles string timestamps', () => {
    const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000)).toISOString()
    expect(getRelativeTime(fiveMinutesAgo)).toBe('5m ago')
  })
})
