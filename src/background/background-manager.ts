import browser from "webextension-polyfill";
import { ExtensionMessage, LockStatus } from "../types";
import { updateBadge } from "./update-badge";
import { injectContentScript } from "./inject-content-script";
import { SessionManager } from "./session-manager";

export class BackgroundManager {

    private isInitialized = false;

    constructor(
        private sessionManager: SessionManager = new SessionManager(),
    ) {
        this.handleMessage = this.handleMessage.bind(this);
        this.handleTabRemoved = this.handleTabRemoved.bind(this);
        this.handleTabUpdated = this.handleTabUpdated.bind(this);
    }

    public init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        browser.runtime.onMessage.addListener(this.handleMessage);
        browser.tabs.onRemoved.addListener(this.handleTabRemoved);
        browser.tabs.onUpdated.addListener(this.handleTabUpdated);
    }

    private async handleMessage(message: ExtensionMessage, sender: browser.Runtime.MessageSender): Promise<any> {
        const senderTabId = sender.tab?.id;
        const { status, type } = message;

        switch (type) {
            case "STATUS_UPDATE":
                return this.handleStatusUpdate(status, senderTabId);
            case "GET_STATUS":
                return this.handleGetStatus();
            case "TOGGLE_SESSION":
                return this.handleToggleSession();
        }
    }

    private handleStatusUpdate( status: LockStatus, tabId?: number,) {
        if (!tabId) return;

        if (status === "inactive") {
            this.sessionManager.delete(tabId);
        } else {
            this.sessionManager.set(tabId, status);
        }
        updateBadge(tabId, status);
    }

    private async handleGetStatus() {
        const activeTabId = await this.getActiveTabId();
        if (activeTabId) return { status: this.sessionManager.get(activeTabId) };
        return { status: "inactive" };
    }

    private async handleToggleSession() {
        const activeTabId = await this.getActiveTabId();
        if (!activeTabId) return;

        const currentStatus = this.sessionManager.get(activeTabId);

        if (currentStatus === "active") {
            try {
                await browser.tabs.sendMessage(activeTabId, { type: "RELEASE_LOCK" });
            } catch (e) {
                this.sessionManager.delete(activeTabId);
                updateBadge(activeTabId, "inactive");
            }
        } else {
            try {
                await injectContentScript(activeTabId);
            } catch (e: any) {
                console.error("Failed to inject script:", e);
                this.sessionManager.set(activeTabId, "error");
                updateBadge(activeTabId, "error");
                return { status: "error", error: e.message };
            }
        }
        return { status: "pending" };
    }

    private async getActiveTabId(): Promise<number | undefined> {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        return tabs[0]?.id;
    }

    private handleTabUpdated(tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) {
        if (changeInfo.status !== 'loading') return

        this.sessionManager.delete(tabId);
        updateBadge(tabId, "inactive");
    }

    
    private handleTabRemoved(tabId: number) {
        this.sessionManager.delete(tabId);
    }

}
