import browser from 'webextension-polyfill';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { updateBadge } from './update-badge';

const mockBrowser = vi.mocked(browser, true);

describe('updateBadge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        { status: 'active', text: 'ON', color: '#2ecc71' },
        { status: 'error', text: 'ERR', color: '#e74c3c' },
        { status: 'inactive', text: '', color: undefined },
        { status: 'unknown', text: '', color: undefined },
    ])('should update badge correctly for status: $status', ({ status, text, color }) => {
        const tabId = 123;
        updateBadge(tabId, status as any);

        expect(mockBrowser.action.setBadgeText).toHaveBeenCalledWith({
            text,
            tabId,
        });

        if (color) {
            expect(mockBrowser.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
                color,
                tabId,
            });
        } else {
            expect(mockBrowser.action.setBadgeBackgroundColor).not.toHaveBeenCalled();
        }
    });
});
