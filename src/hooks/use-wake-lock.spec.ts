import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import browser from "webextension-polyfill";
import { useWakeLock } from './use-wake-lock';
import { renderHook } from '../test/utils';
import { act } from 'react';
import { sendExtensionMessage } from '../pages/utils/send-extension-message';

vi.mock('../pages/utils/send-extension-message');

const mockSendExtensionMessage = vi.mocked(sendExtensionMessage);

describe("useWakeLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.stubGlobal("close", vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should initialize with status from background', async () => {
    mockSendExtensionMessage.mockResolvedValue({ status: 'active' });
    const { result } = renderHook(() => useWakeLock(false));

    await vi.waitFor(() => {
      expect(result.current.status).toBe("active");
    });
    expect(mockSendExtensionMessage).toHaveBeenCalledWith({ type: 'GET_STATUS' });
  });

  it("should update status when receiving STATUS_UPDATE message", async () => {
    let messageCallback: (msg: any) => void;

    vi.mocked(browser.runtime.onMessage.addListener).mockImplementation((cb: any) => {
        messageCallback = cb;
    });

    const { result } = renderHook(() => useWakeLock(false));

    act(() => {
      if (messageCallback) {
        messageCallback({ type: "STATUS_UPDATE", status: "pending" });
      }
    });

    await vi.waitFor(() => {
      expect(result.current.status).toBe("pending");
    });
  });

  it("should clean up listener on unmount", () => {
    const { unmount } = renderHook(() => useWakeLock(false));
    unmount();
    expect(vi.mocked(browser.runtime.onMessage.removeListener)).toHaveBeenCalled();
  });

  it('should handle toggle session', async () => {
    mockSendExtensionMessage
      .mockResolvedValueOnce({ status: 'active' }) // For initial GET_STATUS
      .mockResolvedValueOnce({ status: 'inactive' }); // For TOGGLE_SESSION

    const { result } = renderHook(() => useWakeLock(false));
    
    // Wait for initial status to be set
    await vi.waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    await act(async () => {
      await result.current.toggleSession();
    });

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({ type: 'TOGGLE_SESSION' });
    expect(result.current.status).toBe('inactive');
  });


  
  it('should close window on android when pending', async () => {
      mockSendExtensionMessage.mockResolvedValue({ status: 'pending' });
      const { result } = renderHook(() => useWakeLock(true)); // isAndroid = true
      
      // Initial status check
      act(() => {
        // flush initial effect
      });

    await act(async () => {
      await result.current.toggleSession();
    });

    expect(result.current.status).toBe("pending");

    act(() => {
      vi.advanceTimersByTime(300);
    });``

    expect(window.close).toHaveBeenCalled();
  });

  it('should NOT close window on desktop when pending', async () => {
      mockSendExtensionMessage.mockResolvedValue({ status: 'pending' });
      const { result } = renderHook(() => useWakeLock(false)); // isAndroid = false
      
      await act(async () => {
          await result.current.toggleSession();
      });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(window.close).not.toHaveBeenCalled();
  });

  it('should handle error during toggle session', async () => {
    mockSendExtensionMessage
      .mockResolvedValueOnce({ status: 'active' }) // For initial GET_STATUS
      .mockResolvedValueOnce({ status: 'error', error: 'Test error message' }); // For TOGGLE_SESSION

    const { result } = renderHook(() => useWakeLock(false));

    // Wait for initial status to be set
    await vi.waitFor(() => {
      expect(result.current.status).toBe('active');
    });

    await act(async () => {
      await result.current.toggleSession();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errorMsg).toBe('Test error message');
  });
});
