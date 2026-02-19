import browser from 'webextension-polyfill';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getOperatingSystem } from './get-operating-system';

const mockBrowser = vi.mocked(browser, true);

describe('getOperatingSystem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return the operating system string from platform info', async () => {
        mockBrowser.runtime.getPlatformInfo.mockResolvedValue({
            os: 'android',
            arch: 'arm'
        } as browser.Runtime.PlatformInfo);

        const result = await getOperatingSystem();

        expect(result).toBe('android');
        expect(mockBrowser.runtime.getPlatformInfo).toHaveBeenCalled();
    });

    it('should return null if getting platform info fails', async () => {
        mockBrowser.runtime.getPlatformInfo.mockRejectedValue(new Error('Failed to get platform info'));

        const result = await getOperatingSystem();

        expect(result).toBeNull();
        expect(mockBrowser.runtime.getPlatformInfo).toHaveBeenCalled();
    });
});
