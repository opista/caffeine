import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import browser from "webextension-polyfill";
import { useWakeLock } from './use-wake-lock';
import { renderHook } from '../test/utils';
import { act } from 'react';
import { sendExtensionMessage } from '../pages/utils/send-extension-message';

// Mock browser
const mockAddListener = vi.fn();
const mockRemoveListener = vi.fn();
const mockSendMessage = vi.fn(); // Keep this mock for webextension-polyfill internals if needed, though we mock sendExtensionMessage directly now.

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

// Mock sendExtensionMessage
vi.mock('../pages/utils/send-extension-message', () => ({
  sendExtensionMessage: vi.fn(),
}));

const mockSendExtensionMessage = vi.mocked(sendExtensionMessage);

describe('useWakeLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendExtensionMessage.mockResolvedValue({});
    
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
    mockSendExtensionMessage.mockResolvedValue({ status: 'active' });
    const { result } = renderHook(() => useWakeLock(false));

    await vi.waitFor(() => {
      expect(result.current.status).toBe('active');
    });
    expect(mockSendExtensionMessage).toHaveBeenCalledWith({ type: 'GET_STATUS' });
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
    mockSendExtensionMessage.mockResolvedValue({ status: 'active' }); // Initial check
    const { result } = renderHook(() => useWakeLock(false));
    
    // Reset mock to return new status on toggle
    mockSendExtensionMessage.mockResolvedValue({ status: 'inactive' });

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

      expect(result.current.status).toBe('pending');
      
      // Fast-forward time for setTimeout
      act(() => {
          vi.advanceTimersByTime(300);
      });
      
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
    mockSendExtensionMessage.mockResolvedValue({ status: 'active' }); // Initial check
    const { result } = renderHook(() => useWakeLock(false));

    // Reset mock to return error on toggle
    mockSendExtensionMessage.mockResolvedValue({ status: 'error', error: 'Test error message' });

    await act(async () => {
      await result.current.toggleSession();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errorMsg).toBe('Test error message');
  });
});
