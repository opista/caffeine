import { describe, it, expect, vi, beforeEach } from 'vitest';
import browser from "webextension-polyfill";
import { useActiveTab } from './use-active-tab';
import { renderHook } from '../test/utils';

const mockBrowser = vi.mocked(browser, true)

describe('useActiveTab', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return hostname and isSupportedUrl=true for valid https url', async () => {
        mockBrowser.tabs.query.mockResolvedValue([{ url: 'https://www.example.com/path' }] as browser.Tabs.Tab[]);
        const { result } = renderHook(() => useActiveTab());

        await vi.waitFor(() => {
            expect(result.current).toEqual({
                hostname: 'www.example.com',
                isSupportedUrl: true
            });
        });
    });

    it('should return hostname and isSupportedUrl=false for http url', async () => {
        mockBrowser.tabs.query.mockResolvedValue([{ url: 'http://www.example.com/path' }] as browser.Tabs.Tab[]);
        const { result } = renderHook(() => useActiveTab());

        await vi.waitFor(() => {
            expect(result.current).toEqual({
                hostname: 'www.example.com',
                isSupportedUrl: false
            });
        });
    });

    it('should return Unknown Page when URL parsing fails', async () => {
            mockBrowser.tabs.query.mockResolvedValue([{ url: 'httpbutwillfail' }] as browser.Tabs.Tab[]);
            const { result } = renderHook(() => useActiveTab());

            await vi.waitFor(() => {
                expect(result.current).toEqual({
                    hostname: 'Unknown Page',
                    isSupportedUrl: false
                });
            });
    });

    it('should return Unsupported Page for non-http url', async () => {
        mockBrowser.tabs.query.mockResolvedValue([{ url: 'chrome://extensions' }] as browser.Tabs.Tab[]);
        const { result } = renderHook(() => useActiveTab());

        await vi.waitFor(() => {
            expect(result.current).toEqual({
                hostname: 'Unsupported Page',
                isSupportedUrl: false
            });
        });
    });

    it('should return Unsupported Page if no active tab found', async () => {
        mockBrowser.tabs.query.mockResolvedValue([] as browser.Tabs.Tab[]);
        const { result } = renderHook(() => useActiveTab());

        await vi.waitFor(() => {
            expect(result.current).toEqual({
                hostname: 'Unsupported Page',
                isSupportedUrl: false
            });
        });
    });
});
