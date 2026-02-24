import { vi } from "vitest";

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("webextension-polyfill", () => ({
  default: {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      sendMessage: vi.fn().mockResolvedValue(undefined),
      getPlatformInfo: vi.fn().mockResolvedValue({ os: "linux", arch: "x86-64" }),
    },
    tabs: {
      create: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      onRemoved: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      onUpdated: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      onActivated: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      query: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn().mockResolvedValue(undefined),
    },
    action: {
      setBadgeText: vi.fn().mockResolvedValue(undefined),
      setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    },
    scripting: {
      executeScript: vi.fn().mockResolvedValue([]),
    },
    storage: {
      session: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
    },
    permissions: {
      request: vi.fn().mockResolvedValue(true),
      contains: vi.fn().mockResolvedValue(true),
      remove: vi.fn().mockResolvedValue(true),
    },
  }
}));
