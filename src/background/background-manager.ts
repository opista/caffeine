import browser from "webextension-polyfill";
import { ExtensionMessage, LockStatus, RuleType } from "../types";
import { updateBadge } from "./update-badge";
import { injectContentScript } from "./inject-content-script";
import { SessionManager } from "./session-manager";
import { RuleManager } from "./rules/rule-manager";
import { getOperatingSystem } from "./get-operating-system";
import { getRootDomain } from "../utils/get-root-domain";
import { createDomainOriginPermissionString } from "./create-domain-origin-permission-string";

export class BackgroundManager {
    private isInitialized = false;
    private isProcessing = false;
    private lastActiveWebTabId: number | undefined;

    constructor(
        private sessionManager: SessionManager = new SessionManager(),
        private ruleManager: RuleManager = new RuleManager(),
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

        switch (message.type) {
            case "STATUS_UPDATE":
                return this.handleStatusUpdate(message.status, senderTabId, message.error);
            case "GET_STATUS":
                return this.handleGetStatus(senderTabId);
            case "TOGGLE_SESSION":
                return this.handleToggleSession(senderTabId);
            case "GET_PLATFORM_INFO":
                return this.handleGetPlatformInfo();
            case "ADD_RULE":
                if (senderTabId !== undefined) return;
                return this.ruleManager.addRule(message.ruleType, message.url);
            case "REMOVE_RULE":
                if (senderTabId !== undefined) return;
                return this.ruleManager.removeRule(message.ruleType, message.url);
            case "GET_RULE_FOR_TAB":
                return this.handleGetRuleForTab(senderTabId);
            case "GET_PERMISSION_FOR_TAB":
                return this.handleGetPermissionForTab(senderTabId);
        }
    }

    private async handleStatusUpdate(status: LockStatus, tabId?: number, error?: string) {
        if (!tabId) return;

        if (status === "inactive") {
            await this.sessionManager.delete(tabId);
        } else {
            await this.sessionManager.set(tabId, status, error);
        }
        updateBadge(tabId, status);
    }

    private async handleGetStatus(tabId?: number) {
        const targetTabId = tabId ?? await this.getActiveTabId();
        if (!targetTabId) return { status: "inactive" };

        const state = await this.sessionManager.get(targetTabId);
        return state;
    }

    private async handleToggleSession(tabId?: number) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        const targetTabId = tabId ?? await this.getActiveTabId();
        if (!targetTabId) {
            this.isProcessing = false;
            return;
        }

        const { status: currentStatus } = await this.sessionManager.get(targetTabId);

        if (currentStatus === "active") {
            try {
                await browser.tabs.sendMessage(targetTabId, { type: "RELEASE_LOCK" });
            } catch (e) {
                await this.sessionManager.delete(targetTabId);
                updateBadge(targetTabId, "inactive");
            } finally {
                this.isProcessing = false;
            }
            return { status: "inactive" };
        } else {
            const tab = await browser.tabs.get(targetTabId);
            if (!tab.url?.startsWith('https://')) {
                this.isProcessing = false;
                const error = "Wake Lock requires a secure (HTTPS) page";
                await this.sessionManager.set(targetTabId, "error", error);
                updateBadge(targetTabId, "error");
                return { status: "error", error };
            }

            try {
                await injectContentScript(targetTabId);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Unknown error";
                await this.sessionManager.set(targetTabId, "error", message);
                updateBadge(targetTabId, "error");
                return { status: "error", error: message };
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

    private async handleGetRuleForTab(tabId?: number) {
        const targetTabId = tabId ?? await this.getActiveTabId();
        if (!targetTabId) return null;
 
        const tab = await browser.tabs.get(targetTabId);
        if (!tab.url || !tab.url.startsWith('http')) return null;
 
        const ruleState = await this.ruleManager.getRuleState(tab.url);
 
        return { ruleState };
    }

    private async handleGetPermissionForTab(tabId?: number) {
        const targetTabId = tabId ?? await this.getActiveTabId();
        if (!targetTabId) return null;

        const tab = await browser.tabs.get(targetTabId);
        if (!tab.url || !tab.url.startsWith('http')) return null;

        const rootDomain = getRootDomain(tab.url);
        if (!rootDomain) return null;

        return await browser.permissions.contains({ origins: [createDomainOriginPermissionString(rootDomain)] });
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
        if (changeInfo.status === 'loading') {
            await this.sessionManager.delete(tabId);
            updateBadge(tabId, "inactive");
            return;
        }

        if (changeInfo.status === 'complete' && tab.active && tab.url?.startsWith('https://')) {
            this.lastActiveWebTabId = tabId;
            
            // Auto-activation logic
            const ruleState = await this.ruleManager.getRuleState(tab.url);
            if (ruleState) {
                const hasPermission = await browser.permissions.contains({ origins: [createDomainOriginPermissionString(ruleState.rootDomain)] });
                
                if (hasPermission) {
                    // Activate!
                    try {
                        await injectContentScript(tabId);
                    } catch (e: unknown) {
                         const message = e instanceof Error ? e.message : "Unknown error";
                         await this.sessionManager.set(tabId, "error", message);
                         updateBadge(tabId, "error");
                    }
                } else {
                    // Permission revoked - show error
                    await this.sessionManager.set(tabId, "error", "Permission revoked");
                    updateBadge(tabId, "error");
                }
            }
        }
    }

    private async handleTabRemoved(tabId: number) {
        if (this.lastActiveWebTabId === tabId) {
            this.lastActiveWebTabId = undefined;
        }
        await this.sessionManager.delete(tabId);
    }
}
