import browser from "webextension-polyfill";
import { ExtensionMessage, LockStatus } from "../types";
import { updateBadge } from "./update-badge";
import { injectContentScript } from "./inject-content-script";
import { SessionManager } from "./session-manager";
import { getOperatingSystem } from "./get-operating-system";

export class BackgroundManager {
    private isInitialized = false;
    private isProcessing = false;
    private lastActiveWebTabId: number | undefined;

    constructor(
        private sessionManager: SessionManager = new SessionManager(),
    ) {
        this.handleMessage = this.handleMessage.bind(this);
        this.handleTabRemoved = this.handleTabRemoved.bind(this);
        this.handleTabUpdated = this.handleTabUpdated.bind(this);
        this.handleTabActivated = this.handleTabActivated.bind(this);
    }

    public init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        browser.runtime.onMessage.addListener(this.handleMessage);
        browser.tabs.onRemoved.addListener(this.handleTabRemoved);
        browser.tabs.onUpdated.addListener(this.handleTabUpdated);
        browser.tabs.onActivated.addListener(this.handleTabActivated);
    }

    private handleMessage(message: ExtensionMessage, sender: browser.Runtime.MessageSender) {
        const senderTabId = sender.tab?.id;
        const { status, type, error } = message;

        switch (type) {
            case "STATUS_UPDATE":
                return this.handleStatusUpdate(status, senderTabId, error);
            case "GET_STATUS":
                return this.handleGetStatus();
            case "TOGGLE_SESSION":
                return this.handleToggleSession();
            case "GET_PLATFORM_INFO":
                return this.handleGetPlatformInfo();
        }
    }

    private async handleStatusUpdate( status: LockStatus, tabId?: number, error?: string) {
        if (!tabId) return;

        if (status === "inactive") {
            await this.sessionManager.delete(tabId);
        } else {
            await this.sessionManager.set(tabId, status, error);
        }
        updateBadge(tabId, status);
    }

    private async handleGetStatus() {
        const activeTabId = await this.getActiveTabId();
        if (!activeTabId) return { status: "inactive" };

        const state = await this.sessionManager.get(activeTabId);
        return state;
    }

    private async handleToggleSession() {
        if (this.isProcessing) return; 
        this.isProcessing = true;
        const activeTabId = await this.getActiveTabId();
        if (!activeTabId) {
            this.isProcessing = false;
            return;
        }

        const { status: currentStatus } = await this.sessionManager.get(activeTabId);

        if (currentStatus === "active") {
            try {
                await browser.tabs.sendMessage(activeTabId, { type: "RELEASE_LOCK" });
            } catch (e) {
                await this.sessionManager.delete(activeTabId);
                updateBadge(activeTabId, "inactive");
            } finally {
                this.isProcessing = false;
            }
            return { status: "inactive" };
        } else {
            const tab = await browser.tabs.get(activeTabId);
            if (!tab.url?.startsWith('https://')) {
                this.isProcessing = false;
                const error = "Wake Lock requires a secure (HTTPS) page";
                await this.sessionManager.set(activeTabId, "error", error);
                updateBadge(activeTabId, "error");
                return { status: "error", error };
            }

            try {
                await injectContentScript(activeTabId);
            } catch (e: any) {
                await this.sessionManager.set(activeTabId, "error", e.message);
                updateBadge(activeTabId, "error");
                return { status: "error", error: e.message };
            } finally {
                this.isProcessing = false;
            }
            return { status: "pending" };
        }
    }
    
    private async handleGetPlatformInfo() {
        const os = await getOperatingSystem();
        return { os };
    }

    private async getActiveTabId(): Promise<number | undefined> {
        const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.url?.startsWith('http')) return activeTab.id;
        return this.lastActiveWebTabId;
    }

    private async handleTabActivated(activeInfo: browser.Tabs.OnActivatedActiveInfoType) {
        const tab = await browser.tabs.get(activeInfo.tabId);
        if (tab.url?.startsWith('http')) {
            this.lastActiveWebTabId = tab.id;
        }
    }

    private async handleTabUpdated(tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType, tab: browser.Tabs.Tab) {
        if (changeInfo.status === 'complete' && tab.active && tab.url?.startsWith('http')) {
            this.lastActiveWebTabId = tabId;
        }

        if (changeInfo.status !== 'loading') return;

        await this.sessionManager.delete(tabId);
        updateBadge(tabId, "inactive");
    }

    private async handleTabRemoved(tabId: number) {
        if (this.lastActiveWebTabId === tabId) {
            this.lastActiveWebTabId = undefined;
        }
        await this.sessionManager.delete(tabId);
    }
}
