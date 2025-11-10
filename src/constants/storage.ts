export const STORAGE_KEYS = {
  tabs: 'tabs',
  theme: 'tabsago_theme',
  mode: 'tabsago_mode',
  sort: 'tabsago_sort',
  lifeboat: 'tabs_lifeboat',
  showLifeboat: 'tabs_show_lifeboat',
  thumbnails: 'tabsago_thumbnails',
  tabSave: 'tabsago_tab_save',
  autoCaptureOnClose: 'tabsago_auto_capture_on_close',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]


