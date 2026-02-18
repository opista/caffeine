import browser from "webextension-polyfill";
import { ExtensionMessage } from "../types";

export class WakeLockManager {
    private wakeLock: WakeLockSentinel | null = null;
    private isEnabled = false;

    private isSupported = false;

    constructor() {
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleLockRelease = this.handleLockRelease.bind(this);
        this.handleMessage = this.handleMessage.bind(this);

        if ('wakeLock' in navigator && navigator.wakeLock) {
            this.isSupported = true;
        }
    }

    public start() {
        if (!this.isSupported) {
             this.sendMessage({ type: "STATUS_UPDATE", status: "error", error: "Wake Lock API not supported" });
             return;
        }

        this.isEnabled = true;
        this.requestWakeLock();
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        browser.runtime.onMessage.addListener(this.handleMessage);
    }

    public async stop() {
        this.isEnabled = false;
        await this.releaseWakeLock();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        browser.runtime.onMessage.removeListener(this.handleMessage);
        this.sendMessage({ type: "STATUS_UPDATE", status: "inactive" });
    }

    private async requestWakeLock() {
        if (!this.isEnabled) return;

        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            this.wakeLock?.addEventListener('release', this.handleLockRelease);
            this.sendMessage({ type: "STATUS_UPDATE", status: "active" });
        } catch (err: any) {
            let errorMsg = "Unknown error";
            if (err.name === 'NotAllowedError') {
                errorMsg = "System blocked wake lock (Check Battery Saver)";
            } else if (err.name === 'NotSupportedError') {
                 errorMsg = "Device does notq support wake lock";
            }
            this.sendMessage({ type: "STATUS_UPDATE", status: "error", error: errorMsg });
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
        if (this.isEnabled) {
             this.sendMessage({ type: "STATUS_UPDATE", status: "inactive" });
        }
        this.wakeLock = null;
    }

    private handleVisibilityChange() {
        const documentIsVisible = document.visibilityState === 'visible';
        if (this.isEnabled && documentIsVisible && !this.wakeLock) {
            this.requestWakeLock();
        }
    }


    private sendMessage(msg: ExtensionMessage) {
        browser.runtime.sendMessage(msg).catch();
    }
}
