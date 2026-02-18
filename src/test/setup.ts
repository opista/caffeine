import { vi } from 'vitest';

vi.mock('webextension-polyfill', () => ({
    default: {
        runtime: {
            onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
            },
            sendMessage: vi.fn().mockResolvedValue(undefined),
        },
        tabs: {
            onRemoved: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
            },
            onUpdated: {
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
            }
        },
    },
}));
