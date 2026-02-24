import { ExtensionMessage } from "../types";
import browser from "webextension-polyfill";
import { showToast } from "./show-toast";

export class WakeLockManager {
  private isAndroid = false;
  private isEnabled = false;
  private isSupported = false;
  private platformInitialized = false;
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
      const response = await browser.runtime.sendMessage({ type: "GET_PLATFORM_INFO" });
      if (response && response.os) {
        this.isAndroid = response.os === "android";
      }
    } finally {
      this.platformInitialized = true;
    }
  }

  public async start() {
    if (!this.isSupported) {
      this.sendMessage({
        type: "STATUS_UPDATE",
        status: "error",
        error: "Wake Lock API not supported",
      });
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
    this.sendMessage({ type: "STATUS_UPDATE", status: "inactive" });
  }

  private async requestWakeLock() {
    if (!this.isEnabled) return;

    if (!window.isSecureContext) {
      this.sendMessage({
        type: "STATUS_UPDATE",
        status: "error",
        error: "Wake Lock requires a secure (HTTPS) connection",
      });
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request("screen");
      this.wakeLock?.addEventListener("release", this.handleLockRelease);
      this.sendMessage({ type: "STATUS_UPDATE", status: "active" });
      if (this.isAndroid) showToast("☕ Caffeine active", "success");
    } catch (err: any) {
      // On Android, the popup steals focus from the page, causing
      // NotAllowedError on the initial request. The focus listener
      // will retry when the popup closes and focus returns.
      if (err.name === "NotAllowedError" && this.isAndroid && !this.wakeLock) {
        return;
      }
      const errorMsg =
        err.name === "NotAllowedError"
          ? "System blocked wake lock (check Battery Saver)"
          : err.name === "NotSupportedError"
            ? "Device does not support wake lock"
            : "Unknown error";
      this.sendMessage({ type: "STATUS_UPDATE", status: "error", error: errorMsg });
      if (this.isAndroid) showToast("⚠️ " + errorMsg, "error");
    }
  }

  private async releaseWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  private async handleMessage(message: ExtensionMessage) {
    if (message.type === "RELEASE_LOCK") {
      await this.stop();
    }
  }

  private handleLockRelease() {
    if (!this.isEnabled) {
      this.sendMessage({ type: "STATUS_UPDATE", status: "inactive" });
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
