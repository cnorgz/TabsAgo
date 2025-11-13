export const PREF_KEYS = {
  AUTO_THUMBNAIL_CAPTURE: 'tabsago_auto_thumbnail_capture'
} as const

export const PREF_DEFAULTS = {
  [PREF_KEYS.AUTO_THUMBNAIL_CAPTURE]: true
} as const

export type PrefKey = typeof PREF_KEYS[keyof typeof PREF_KEYS]
