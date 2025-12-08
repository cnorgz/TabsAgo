import { useCallback, useEffect, useRef, useState } from 'react'

import { StorageKey } from '../constants/storage'
import { StorageService } from '../services/StorageService'

export function useChromeStorage<T>(key: StorageKey, initialValue: T) {
  // Use a ref for initialValue to ensure stability across renders
  const initialValueRef = useRef(initialValue); 

  // Initialize state with the stable initial value from the ref
  const [value, setValue] = useState<T>(initialValueRef.current);
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    ;(async () => {
      const v = await StorageService.get<T>(key)
      if (!mountedRef.current) return
      // Use the stable initial value from the ref for fallback
      setValue(v ?? initialValueRef.current) 
    })()

    function handleChange(changes: { [key: string]: chrome.storage.StorageChange }, area: string) {
      if (area !== 'local') return
      if (Object.prototype.hasOwnProperty.call(changes, key)) {
        const change = changes[key]
        // Use the stable initial value from the ref for fallback
        setValue(change.newValue ?? initialValueRef.current) 
      }
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => {
      mountedRef.current = false
      chrome.storage.onChanged.removeListener(handleChange)
    }
  }, [key]) // `initialValueRef` is stable, so only `key` needs to be in deps.

  // Memoize `save` using useCallback to prevent it from being redefined on every render
  const save = useCallback(async (next: T) => { 
    setValue(next)
    await StorageService.set<T>(key, next)
  }, [key]) // `key` is a stable dependency

  return { value, setValue: save }
}


