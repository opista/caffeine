import { ExtensionMessage, MessageType, ErrorCode } from "../types";
import browser from "webextension-polyfill";
import { showToast } from "./show-toast";

export class WakeLockManager {
  private isAndroid = false;
  private isEnabled = false;
  private isSupported = false;
  private platformInitialized = false;
  private isManual = false;
  private wakeLock: WakeLockSentinel | null = null;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleLockRelease = this.handleLockRelease.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handlePageShow = this.handlePageShow.bind(this);

    if ("wakeLock" in navigator && navigator.wakeLock) {
      this.isSupported = true;
    }
  }

  private async initPlatform() {
    if (this.platformInitialized) return;

    try {
      const response = await browser.runtime.sendMessage({ type: MessageType.GET_PLATFORM_INFO });
      if (response?.os) {
        this.isAndroid = response.os === "android";
      }
      this.isManual = response?.isManual ?? false;
    } finally {
      this.platformInitialized = true;
    }
  }

  public async start() {
    if (!this.isSupported) {
      this.sendMessage({ type: MessageType.STATUS_UPDATE, status: "error", error: ErrorCode.NOT_SUPPORTED });
      return;
    }

    await this.initPlatform();
    this.isEnabled = true;

    this.requestWakeLock();

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("focus", this.handleVisibilityChange);
    window.addEventListener("pageshow", this.handlePageShow);
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  public async stop() {
    this.isEnabled = false;
    await this.releaseWakeLock();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("focus", this.handleVisibilityChange);
    window.removeEventListener("pageshow", this.handlePageShow);
    browser.runtime.onMessage.removeListener(this.handleMessage);
    this.sendMessage({ type: MessageType.STATUS_UPDATE, status: "inactive" });
  }

  private async requestWakeLock() {
    if (!this.isEnabled) return;

    if (!window.isSecureContext) {
      this.sendMessage({
        type: MessageType.STATUS_UPDATE,
        status: "error",
        error: ErrorCode.NOT_SECURE,
      });
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request("screen");
      this.wakeLock?.addEventListener("release", this.handleLockRelease);
      this.sendMessage({ type: MessageType.STATUS_UPDATE, status: "active" });
      if (this.isAndroid && this.isManual) showToast("☕ Caffeine active", "success");
      this.isManual = false; // Reset after first use
    } catch (err: unknown) {
      // On Android, the popup steals focus from the page, causing
      // NotAllowedError on the initial request. The focus listener
      // will retry when the popup closes and focus returns.
      const errorName = err instanceof Error ? err.name : (err as any)?.name;
      if (errorName === "NotAllowedError" && this.isAndroid && !this.wakeLock) {
        return;
      }
      const errorMsg =
        errorName === "NotAllowedError"
          ? ErrorCode.SYSTEM_BLOCKED
          : errorName === "NotSupportedError"
            ? ErrorCode.NOT_SUPPORTED
            : errorName || ErrorCode.UNKNOWN;
      this.sendMessage({ type: MessageType.STATUS_UPDATE, status: "error", error: errorMsg });
      if (this.isAndroid) {
        const toastMsg =
          errorMsg === ErrorCode.SYSTEM_BLOCKED
            ? "System blocked wake lock (check Battery Saver)"
            : errorMsg === ErrorCode.NOT_SUPPORTED
              ? "Device does not support wake lock"
              : "Unknown error";
        showToast("⚠️ " + toastMsg, "error");
      }
    }
  }

  private async releaseWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  private async handleMessage(message: ExtensionMessage) {
    if (message.type === MessageType.RELEASE_LOCK) {
      await this.stop();
    }
  }

  private handleLockRelease() {
    if (!this.isEnabled) {
      this.sendMessage({ type: MessageType.STATUS_UPDATE, status: "inactive" });
    }
    this.wakeLock = null;
  }

  private handleVisibilityChange() {
    const documentIsVisible = document.visibilityState === "visible";
    if (this.isEnabled && documentIsVisible && !this.wakeLock) {
      this.requestWakeLock();
    }
  }

  private handlePageShow(event: PageTransitionEvent) {
    if (event.persisted && this.isEnabled && !this.wakeLock) {
      this.requestWakeLock();
    }
  }

  private sendMessage(msg: ExtensionMessage) {
    browser.runtime.sendMessage(msg).catch(console.error);
  }
}
