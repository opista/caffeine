import { describe, it, expect, vi, beforeEach } from 'vitest';
import browser from "webextension-polyfill";
import { usePlatform } from './use-platform';
import { renderHook } from '../test/utils';

const mockBrowser = vi.mocked(browser, true)

describe('usePlatform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null platform', async () => {
    mockBrowser.runtime.getPlatformInfo.mockResolvedValue({ os: 'mac', arch: 'arm' });
    const { result } = renderHook(() => usePlatform());
    
    expect(result.current!.platform).toBe(null);
    expect(result.current!.isAndroid).toBe(false);
  });

  it('should update state with platform info', async () => {
    mockBrowser.runtime.getPlatformInfo.mockResolvedValue({ os: 'android', arch: 'arm' });
    const { result } = renderHook(() => usePlatform());

    // Wait for async effect
    await vi.waitFor(() => {
        expect(result.current!.platform).toBe('android');
    });
    
    expect(result.current!.isAndroid).toBe(true);
  });

  it('should handle non-android platform correctly', async () => {
    mockBrowser.runtime.getPlatformInfo.mockResolvedValue({ os: 'win', arch: 'arm' });
    const { result } = renderHook(() => usePlatform());

    await vi.waitFor(() => {
        expect(result.current!.platform).toBe('win');
    });

    expect(result.current!.isAndroid).toBe(false);
  });
});
