import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '../test/utils';
import { act } from 'react';
import { useGlobalPermissions } from './use-global-permissions';
import browser from 'webextension-polyfill';

const mockBrowser = vi.mocked(browser, true);

describe('useGlobalPermissions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBrowser.permissions.contains.mockResolvedValue(false);
        mockBrowser.permissions.request.mockResolvedValue(true);
        mockBrowser.permissions.remove.mockResolvedValue(true);
        vi.stubGlobal('close', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should fetch global permissions on mount', async () => {
        mockBrowser.permissions.contains.mockResolvedValue(true);
        const { result } = renderHook(() => useGlobalPermissions());
        
        await vi.waitUntil(() => result.current.hasGlobalPermission === true);
        
        expect(mockBrowser.permissions.contains).toHaveBeenCalledWith({ origins: ['*://*/*'] });
    });

    it('should toggle global permission on', async () => {
        const { result } = renderHook(() => useGlobalPermissions());
        
        // Wait for initial fetch
        await vi.waitUntil(() => mockBrowser.permissions.contains.mock.calls.length > 0);
        
        await act(async () => {
            await result.current.toggleGlobalPermission();
        });

        expect(mockBrowser.permissions.request).toHaveBeenCalledWith({ origins: ['*://*/*'] });
        expect(window.close).toHaveBeenCalled();
    });

    it('should toggle global permission off', async () => {
        mockBrowser.permissions.contains.mockResolvedValue(true);
        
        const { result } = renderHook(() => useGlobalPermissions());
        
        // Wait for initial state to be true
        await vi.waitUntil(() => result.current.hasGlobalPermission === true);

        await act(async () => {
            await result.current.toggleGlobalPermission();
        });

        expect(mockBrowser.permissions.remove).toHaveBeenCalledWith({ origins: ['*://*/*'] });
        expect(result.current.hasGlobalPermission).toBe(false);
    });
});
