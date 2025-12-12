import { expect, test } from 'vitest'

import { StorageService } from '../../services/StorageService'

test('chrome global is defined', () => {
  expect(globalThis.chrome).toBeDefined()
  expect(chrome.runtime).toBeDefined()
  expect(chrome.storage).toBeDefined()
})

test('can import module using chrome api', () => {
  expect(StorageService).toBeDefined()
  expect(StorageService.get).toBeDefined()
})
