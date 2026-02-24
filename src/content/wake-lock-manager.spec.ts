import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import browser from "webextension-polyfill";
import { WakeLockManager } from "./wake-lock-manager";
import { MessageType } from "../types";

const mockBrowser = vi.mocked(browser, true);
const mockSender = {} as browser.Runtime.MessageSender;
const mockSendResponse = () => {};

describe("WakeLockManager", () => {
  let wakeLockManager: WakeLockManager;
  let requestMock: ReturnType<typeof vi.fn>;
  let releaseMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });

    releaseMock = vi.fn().mockResolvedValue(undefined);
    addEventListenerMock = vi.fn();

    const wakeLockSentinel = {
      release: releaseMock,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      released: false,
      type: "screen" as const,
      onrelease: null,
    };

    requestMock = vi.fn().mockResolvedValue(wakeLockSentinel);

    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      writable: true,
      value: {
        request: requestMock,
      },
    });

    mockBrowser.runtime.sendMessage.mockImplementation(async (msg: any) => {
      if (msg.type === MessageType.GET_PLATFORM_INFO) {
        return { os: "linux" };
      }
      return undefined;
    });

    wakeLockManager = new WakeLockManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should request wake lock on start", async () => {
    await wakeLockManager.start();

    await vi.waitUntil(() => requestMock.mock.calls.length > 0);

    expect(requestMock).toHaveBeenCalledWith("screen");
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.STATUS_UPDATE,
      status: "active",
    });
  });

  it("should release wake lock on stop", async () => {
    await wakeLockManager.start();
    await vi.waitUntil(() => requestMock.mock.calls.length > 0);

    await wakeLockManager.stop();

    expect(releaseMock).toHaveBeenCalled();
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.STATUS_UPDATE,
      status: "inactive",
    });
  });

  it("should handle visibility change to hidden", async () => {
    await wakeLockManager.start();
    await vi.waitUntil(() => requestMock.mock.calls.length > 0);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  it("should re-acquire wake lock when visibility changes to visible", async () => {
    await wakeLockManager.start();
    await vi.waitUntil(() => requestMock.mock.calls.length > 0);

    // Simulate the lock being released (e.g., tab hidden)
    const releaseCallback = addEventListenerMock.mock.calls[0][1];
    releaseCallback();

    // Trigger visibility change to re-acquire
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    await vi.waitUntil(() => requestMock.mock.calls.length > 1);
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  it("should re-acquire wake lock on pageshow from bfcache", async () => {
    await wakeLockManager.start();
    await vi.waitUntil(() => requestMock.mock.calls.length > 0);

    // Simulate the lock being released
    const releaseCallback = addEventListenerMock.mock.calls[0][1];
    releaseCallback();

    // Trigger pageshow with persisted = true
    const event = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(event, "persisted", { value: true });
    window.dispatchEvent(event);

    await vi.waitUntil(() => requestMock.mock.calls.length > 1);
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  it("should handle wake lock not supported", async () => {
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: undefined,
    });

    const localManager = new WakeLockManager();
    await localManager.start();

    await vi.waitUntil(() => mockBrowser.runtime.sendMessage.mock.calls.length > 0);

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.STATUS_UPDATE,
      status: "error",
      error: "Wake Lock API not supported",
    });
  });

  it("should handle wake lock request error", async () => {
    requestMock.mockRejectedValue({ name: "NotAllowedError", message: "Permission denied" });

    await wakeLockManager.start();

    await vi.waitUntil(() => mockBrowser.runtime.sendMessage.mock.calls.length > 0);

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.STATUS_UPDATE,
      status: "error",
      error: "System blocked wake lock (check Battery Saver)",
    });
  });

  it("should stop wake lock on RELEASE_LOCK message", async () => {
    await wakeLockManager.start();
    await vi.waitUntil(() => requestMock.mock.calls.length > 0);

    const onMessageListener = mockBrowser.runtime.onMessage.addListener.mock.calls[0][0];
    await onMessageListener({ type: MessageType.RELEASE_LOCK }, mockSender, mockSendResponse);

    expect(releaseMock).toHaveBeenCalled();
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.STATUS_UPDATE,
      status: "inactive",
    });
  });
});
