/**
 * Logger Utility
 * Provides a safe way to log debug messages in development without spamming production consoles.
 *
 * Usage:
 * import { logger } from '../utils/logger'
 * logger.debug('Something happened', data)
 * logger.error('Something went wrong', error)
 */

// We can toggle this based on a build flag or runtime setting in the future.
// For now, we default to false to keep production clean, but true during active dev could be useful.
const DEBUG_MODE = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  debug: (...args: unknown[]) => {
    if (DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.debug(...args)
    }
  },
  warn: (...args: unknown[]) => {
    // Warnings are always important
    // eslint-disable-next-line no-console
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // Errors are always critical
    // eslint-disable-next-line no-console
    console.error(...args)
  },
}
