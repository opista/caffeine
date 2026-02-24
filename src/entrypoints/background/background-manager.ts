import { browser, type Browser } from "wxt/browser";
import { ExtensionMessage, LockStatus, MessageType, ErrorCode } from "../../types";
import { updateBadge } from "./update-badge";
import { injectContentScript } from "./inject-content-script";
import { SessionManager } from "./session-manager";
import { RuleManager } from "./rules/rule-manager";
import { getOperatingSystem } from "./get-operating-system";
import { getRootDomain } from "../../utils/get-root-domain";
import { createDomainOriginPermissionString } from "./create-domain-origin-permission-string";

export class BackgroundManager {
  private isInitialized = false;
  private isProcessing = false;
  private lastActiveWebTabId: number | undefined;
  private manualTriggerTabIds = new Set<number>();

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
    console.log("[BackgroundManager] Initializing...");

    browser.runtime.onMessage.addListener(this.handleMessage);
    browser.tabs.onRemoved.addListener(this.handleTabRemoved);
    browser.tabs.onUpdated.addListener(this.handleTabUpdated);
    browser.tabs.onActivated.addListener(this.handleTabActivated);
  }

  private handleMessage(message: ExtensionMessage, sender: Browser.runtime.MessageSender) {
    const senderTabId = sender.tab?.id;
    console.log(`[BackgroundManager] Message received: ${message.type}`, { senderTabId, message });

    switch (message.type) {
      case MessageType.STATUS_UPDATE:
        return this.handleStatusUpdate(message.status, senderTabId, message.error);
      case MessageType.GET_STATUS:
        return this.handleGetStatus();
      case MessageType.TOGGLE_SESSION:
        return this.handleToggleSession();
      case MessageType.GET_PLATFORM_INFO:
        return this.handleGetPlatformInfo(senderTabId);
      case MessageType.ADD_RULE:
        console.log(`[BackgroundManager] Adding rule: ${message.ruleType} for ${message.url}`);
        return this.ruleManager.addRule(message.ruleType, message.url);
      case MessageType.REMOVE_RULE:
        console.log(`[BackgroundManager] Removing rule: ${message.ruleType} for ${message.url}`);
        return this.ruleManager.removeRule(message.ruleType, message.url);
      case MessageType.GET_RULE_FOR_TAB:
        return this.handleGetRuleForTab();
      case MessageType.GET_PERMISSION_FOR_TAB:
        return this.handleGetPermissionForTab();
    }
  }

  private async handleStatusUpdate(status: LockStatus, tabId?: number, error?: ErrorCode | string) {
    if (!tabId) return;

    console.log(`[BackgroundManager] Status update for tab ${tabId}: ${status}${error ? ` (${error})` : ""}`);

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
    console.log(`[BackgroundManager] Toggling session for active tab ${activeTabId}. Current status: ${currentStatus}`);

    if (currentStatus === "active") {
      try {
        await browser.tabs.sendMessage(activeTabId, { type: MessageType.RELEASE_LOCK });
      } catch (e: unknown) {
        console.warn(
          `[BackgroundManager] Failed to send RELEASE_LOCK to tab ${activeTabId}. Inactivating manually.`,
          e,
        );
        await this.sessionManager.delete(activeTabId);
        updateBadge(activeTabId, "inactive");
      } finally {
        this.isProcessing = false;
      }
      return { status: "inactive" };
    } else {
      const tab = await browser.tabs.get(activeTabId);
      if (!tab.url?.startsWith("https://")) {
        console.warn(`[BackgroundManager] Cannot toggle session for insecure/unsupported URL: ${tab.url}`);
        this.isProcessing = false;
        const error = ErrorCode.NOT_SECURE;
        await this.sessionManager.set(activeTabId, "error", error);
        updateBadge(activeTabId, "error");
        return { status: "error", error };
      }

      try {
        this.manualTriggerTabIds.add(activeTabId);
        console.log(`[BackgroundManager] Injecting content script for tab ${activeTabId}`);
        await injectContentScript(activeTabId);
      } catch (e: unknown) {
        console.error(`[BackgroundManager] Error injecting content script for tab ${activeTabId}:`, e);
        this.manualTriggerTabIds.delete(activeTabId);
        const message = e instanceof Error ? e.message : "Unknown error";
        await this.sessionManager.set(activeTabId, "error", message);
        updateBadge(activeTabId, "error");
        return { status: "error", error: message };
      } finally {
        this.isProcessing = false;
      }
      return { status: "pending" };
    }
  }

  private async handleGetPlatformInfo(tabId?: number) {
    const os = await getOperatingSystem();
    const isManual = tabId ? this.manualTriggerTabIds.has(tabId) : false;
    if (tabId) this.manualTriggerTabIds.delete(tabId);
    return { os, isManual };
  }

  private async handleGetRuleForTab() {
    const activeTabId = await this.getActiveTabId();
    if (!activeTabId) return null;

    const tab = await browser.tabs.get(activeTabId);
    if (!tab.url || !tab.url.startsWith("http")) return null;

    const ruleState = await this.ruleManager.getRuleState(tab.url);

    return { ruleState };
  }

  private async handleGetPermissionForTab() {
    const activeTabId = await this.getActiveTabId();
    if (!activeTabId) return null;

    const tab = await browser.tabs.get(activeTabId);
    if (!tab.url || !tab.url.startsWith("http")) return null;

    const rootDomain = getRootDomain(tab.url);
    if (!rootDomain) return null;

    return await browser.permissions.contains({
      origins: [createDomainOriginPermissionString(rootDomain)],
    });
  }

  private async getActiveTabId(): Promise<number | undefined> {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.url?.startsWith("http")) return activeTab.id;
    return this.lastActiveWebTabId;
  }

  private async handleTabActivated(activeInfo: Browser.tabs.OnActivatedInfo) {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.url?.startsWith("http")) {
      this.lastActiveWebTabId = tab.id;
    }
  }

  private async handleTabUpdated(tabId: number, changeInfo: Browser.tabs.OnUpdatedInfo, tab: Browser.tabs.Tab) {
    if (changeInfo.status === "loading") {
      await this.sessionManager.delete(tabId);
      updateBadge(tabId, "inactive");
      return;
    }

    if (changeInfo.status === "complete" && tab.active && tab.url?.startsWith("https://")) {
      this.lastActiveWebTabId = tabId;

      // Auto-activation logic
      const ruleState = await this.ruleManager.getRuleState(tab.url);
      if (ruleState) {
        console.log(`[BackgroundManager] Rule found for ${tab.url}. Attempting auto-activation.`, ruleState);
        const hasPermission = await browser.permissions.contains({
          origins: [createDomainOriginPermissionString(ruleState.rootDomain)],
        });

        if (hasPermission) {
          // Activate!
          try {
            console.log(`[BackgroundManager] Auto-activating wake lock for tab ${tabId}`);
            await injectContentScript(tabId);
          } catch (e: unknown) {
            console.error(`[BackgroundManager] Auto-activation failed for tab ${tabId}:`, e);
            const message = e instanceof Error ? e.message : ErrorCode.UNKNOWN;
            await this.sessionManager.set(tabId, "error", message);
            updateBadge(tabId, "error");
          }
        } else {
          // Permission revoked - show error
          console.warn(`[BackgroundManager] Permission required for auto-activation on ${ruleState.rootDomain}`);
          await this.sessionManager.set(tabId, "error", ErrorCode.PERMISSION_REQUIRED);
          updateBadge(tabId, "error");
        }
      }
    }
  }

  private async handleTabRemoved(tabId: number) {
    if (this.lastActiveWebTabId === tabId) {
      this.lastActiveWebTabId = undefined;
    }
    console.log(`[BackgroundManager] Tab ${tabId} removed. Cleaning up session.`);
    await this.sessionManager.delete(tabId);
  }
}
