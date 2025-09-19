import { useEffect, useRef, useState } from 'react'

import { StorageKey } from '../constants/storage'
import { StorageService } from '../services/StorageService'

export function useChromeStorage<T>(key: StorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    ;(async () => {
      const v = await StorageService.get<T>(key)
      if (!mountedRef.current) return
      setValue(v ?? initialValue)
    })()

    function handleChange(changes: { [key: string]: chrome.storage.StorageChange }, area: string) {
      if (area !== 'local') return
      if (Object.prototype.hasOwnProperty.call(changes, key)) {
        const change = changes[key]
        setValue(change.newValue ?? initialValue)
      }
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => {
      mountedRef.current = false
      chrome.storage.onChanged.removeListener(handleChange)
    }
  }, [key, initialValue])

  const save = async (next: T) => {
    setValue(next)
    await StorageService.set<T>(key, next)
  }

  return { value, setValue: save }
}


