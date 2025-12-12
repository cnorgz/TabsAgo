import { vi } from 'vitest'

const storageMock = {
  get: vi.fn((keys, callback) => {
    const result = {}
    if (callback) callback(result)
    return Promise.resolve(result)
  }),
  set: vi.fn((items, callback) => {
    if (callback) callback()
    return Promise.resolve()
  }),
  remove: vi.fn((keys, callback) => {
    if (callback) callback()
    return Promise.resolve()
  }),
  clear: vi.fn((callback) => {
    if (callback) callback()
    return Promise.resolve()
  }),
}

const chromeMock = {
  runtime: {
    id: 'test-id',
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path) => path),
    onInstalled: {
      addListener: vi.fn(),
    }
  },
  storage: {
    local: storageMock,
    sync: storageMock,
    session: storageMock,
  },
  tabs: {
      query: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      captureVisibleTab: vi.fn(),
  }
}

globalThis.chrome = chromeMock as any