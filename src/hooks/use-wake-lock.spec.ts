import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import browser from "webextension-polyfill";
import { useWakeLock } from './use-wake-lock';
import { renderHook } from '../test/utils';
import { act } from 'react';

// Mock browser
const mockAddListener = vi.fn();
const mockRemoveListener = vi.fn();
const mockSendMessage = vi.fn();

vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      sendMessage: (...args: any[]) => mockSendMessage(...args),
      onMessage: {
        addListener: (cb: any) => mockAddListener(cb),
        removeListener: (cb: any) => mockRemoveListener(cb),
      },
      getPlatformInfo: vi.fn(),
    },
  },
}));

describe('useWakeLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMessage.mockResolvedValue({});
    
    // Mock window.close
    vi.stubGlobal('close', vi.fn());
    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should initialize with status from background', async () => {
    mockSendMessage.mockResolvedValue({ status: 'active' });
    const { result } = renderHook(() => useWakeLock(false));

    await vi.waitFor(() => {
      expect(result.current.status).toBe('active');
    });
    expect(mockSendMessage).toHaveBeenCalledWith({ type: 'GET_STATUS' });
  });

  it('should update status when receiving STATUS_UPDATE message', async () => {
    let messageCallback: (msg: any) => void;
    mockAddListener.mockImplementation((cb) => {
        messageCallback = cb;
    });
    
    const { result } = renderHook(() => useWakeLock(false));
    
    // Simulate message
    act(() => {
        if(messageCallback) {
            messageCallback({ type: 'STATUS_UPDATE', status: 'pending' });
        }
    });

    await vi.waitFor(() => {
        expect(result.current.status).toBe('pending');
    });
  });

  it('should clean up listener on unmount', () => {
    const { unmount } = renderHook(() => useWakeLock(false));
    unmount();
    expect(mockRemoveListener).toHaveBeenCalled();
  });

  it('should handle toggle session', async () => {
    mockSendMessage.mockResolvedValue({ status: 'active' }); // Initial check
    const { result } = renderHook(() => useWakeLock(false));
    
    // Reset mock to return new status on toggle
    mockSendMessage.mockResolvedValue({ status: 'inactive' });

    await act(async () => {
      await result.current.toggleSession();
    });

    expect(mockSendMessage).toHaveBeenCalledWith({ type: 'TOGGLE_SESSION' });
    expect(result.current.status).toBe('inactive');
  });


  
  it('should close window on android when pending', async () => {
      mockSendMessage.mockResolvedValue({ status: 'pending' });
      const { result } = renderHook(() => useWakeLock(true)); // isAndroid = true
      
      // Initial status check
      act(() => {
        // flush initial effect
      });

      await act(async () => {
          await result.current.toggleSession();
      });

      expect(result.current.status).toBe('pending');
      
      // Fast-forward time for setTimeout
      act(() => {
          vi.advanceTimersByTime(300);
      });
      
      expect(window.close).toHaveBeenCalled();
  });

  it('should NOT close window on desktop when pending', async () => {
      mockSendMessage.mockResolvedValue({ status: 'pending' });
      const { result } = renderHook(() => useWakeLock(false)); // isAndroid = false
      
      await act(async () => {
          await result.current.toggleSession();
      });

      act(() => {
          vi.advanceTimersByTime(300);
      });
      
      expect(window.close).not.toHaveBeenCalled();
  });
});
