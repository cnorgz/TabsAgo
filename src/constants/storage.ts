export const STORAGE_KEYS = {
  tabs: 'tabs',
  theme: 'tabsago_theme',
  mode: 'tabsago_mode',
  sort: 'tabsago_sort',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]


