import browser from "webextension-polyfill";
import { ExtensionMessage, LockStatus } from "../types";
import { updateBadge } from "./update-badge";
import { injectContentScript } from "./inject-content-script";
import { SessionManager } from "./session-manager";

export class BackgroundManager {
    private isInitialized = false;
    private isProcessing = false;

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

    private async handleStatusUpdate( status: LockStatus, tabId?: number,) {
        if (!tabId) return;

        if (status === "inactive") {
            await this.sessionManager.delete(tabId);
        } else {
            await this.sessionManager.set(tabId, status);
        }
        updateBadge(tabId, status);
    }

    private async handleGetStatus() {
        const activeTabId = await this.getActiveTabId();
        if (!activeTabId) return { status: "inactive" };

        const status = await this.sessionManager.get(activeTabId);
        return { status };
    }

    private async handleToggleSession() {
if (this.isProcessing) return; 
    this.isProcessing = true;
        const activeTabId = await this.getActiveTabId();
        if (!activeTabId) return;

        const currentStatus = await this.sessionManager.get(activeTabId);

        if (currentStatus === "active") {
            try {
                await browser.tabs.sendMessage(activeTabId, { type: "RELEASE_LOCK" });
            } catch (e) {
                await this.sessionManager.delete(activeTabId);
                updateBadge(activeTabId, "inactive");
            } finally {
                this.isProcessing = false;
            }
        } else {
            try {
                await injectContentScript(activeTabId);
            } catch (e: any) {
                console.error("Failed to inject script:", e);
                await this.sessionManager.set(activeTabId, "error");
                updateBadge(activeTabId, "error");
                return { status: "error", error: e.message };
            } finally {
                this.isProcessing = false;
            }
        }
        return { status: "pending" };
    }

    private async getActiveTabId(): Promise<number | undefined> {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        return tabs[0]?.id;
    }

    private async handleTabUpdated(tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) {
        if (changeInfo.status !== 'loading') return

        await this.sessionManager.delete(tabId);
        updateBadge(tabId, "inactive");
    }

    
    private async handleTabRemoved(tabId: number) {
        await this.sessionManager.delete(tabId);
    }

}
