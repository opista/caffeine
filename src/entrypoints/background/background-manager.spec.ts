import { vi, describe, it, expect, beforeEach, Mocked } from "vitest";
import { type Browser } from "wxt/browser";
import { BackgroundManager } from "./background-manager";
import { SessionManager } from "./session-manager";
import { RuleManager } from "./rules/rule-manager";
import { updateBadge } from "./update-badge";
import { injectContentScript } from "./inject-content-script";
import { getOperatingSystem } from "./get-operating-system";
import { MessageType, ErrorCode } from "../../types";
import { browser } from "wxt/browser";

vi.mock("./get-operating-system");
vi.mock("./session-manager");
vi.mock("./rules/rule-manager");
vi.mock("./update-badge");
vi.mock("./inject-content-script");

const mockBrowser = vi.mocked(browser, true);
const mockInjectContentScript = vi.mocked(injectContentScript);
const mockGetOperatingSystem = vi.mocked(getOperatingSystem);

describe("BackgroundManager", () => {
  let manager: BackgroundManager;
  let mockSessionManager: Mocked<SessionManager>;
  let mockRuleManager: Mocked<RuleManager>;

  const mockTabId = 123;
  const mockTab = {
    id: mockTabId,
    url: "https://example.com",
    active: true,
    currentWindow: true,
  } as unknown as Browser.tabs.Tab;
  const mockMessageSender = { tab: { id: mockTabId } } as Browser.runtime.MessageSender;
  const mockSendResponse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetOperatingSystem.mockResolvedValue("linux");

    mockBrowser.tabs.query.mockResolvedValue([mockTab]);
    mockBrowser.tabs.get.mockResolvedValue(mockTab);
    mockBrowser.tabs.sendMessage.mockResolvedValue(undefined);
    mockBrowser.permissions.contains.mockResolvedValue(true);

    mockBrowser.tabs.onActivated = { addListener: vi.fn() } as any;
    mockBrowser.tabs.onUpdated = { addListener: vi.fn() } as any;
    mockBrowser.tabs.onRemoved = { addListener: vi.fn() } as any;
    mockBrowser.runtime.onMessage = { addListener: vi.fn() } as any;
    mockBrowser.permissions.onAdded = { addListener: vi.fn() } as any;

    mockSessionManager = new SessionManager() as Mocked<SessionManager>;
    mockRuleManager = new RuleManager() as Mocked<RuleManager>;

    manager = new BackgroundManager(mockSessionManager, mockRuleManager);
  });

  describe("init", () => {
    it("should register listeners", () => {
      manager.init();
      expect(mockBrowser.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(mockBrowser.tabs.onRemoved.addListener).toHaveBeenCalled();
      expect(mockBrowser.tabs.onUpdated.addListener).toHaveBeenCalled();
      expect(mockBrowser.tabs.onActivated.addListener).toHaveBeenCalled();
    });
  });

  describe("Events", () => {
    beforeEach(() => {
      manager.init();
    });

    describe("handleMessage", () => {
      const sendMessage = async (message: any, sender: any = {}) => {
        const listener = (mockBrowser.runtime.onMessage.addListener as any).mock.calls[0][0];
        return await listener(message, sender, mockSendResponse);
      };

      // Existing tests for STATUS_UPDATE, GET_STATUS, TOGGLE_SESSION, etc.
      describe("STATUS_UPDATE", () => {
        it("should update session and badge on valid status", async () => {
          await sendMessage({ type: MessageType.STATUS_UPDATE, status: "active" }, mockMessageSender);
          expect(mockSessionManager.set).toHaveBeenCalledWith(mockTabId, "active", undefined);
          expect(updateBadge).toHaveBeenCalledWith(mockTabId, "active");
        });
      });

      describe("TOGGLE_SESSION", () => {
        it("should activate session if currently inactive", async () => {
          mockSessionManager.get.mockResolvedValue({ status: "inactive" });
          const response = await sendMessage({ type: MessageType.TOGGLE_SESSION });
          expect(mockInjectContentScript).toHaveBeenCalledWith(mockTabId);
          expect(response).toEqual({ status: "pending" });
        });

        it("should return error if tab is non-HTTPS", async () => {
          mockBrowser.tabs.get.mockResolvedValue({ ...mockTab, url: "http://example.com" } as any);
          mockSessionManager.get.mockResolvedValue({ status: "inactive" });
          const response = await sendMessage({ type: MessageType.TOGGLE_SESSION });

          expect(response).toEqual({ status: "error", error: ErrorCode.NOT_SECURE });
          expect(mockSessionManager.set).toHaveBeenCalledWith(mockTabId, "error", ErrorCode.NOT_SECURE);
          expect(updateBadge).toHaveBeenCalledWith(mockTabId, "error");
        });

        it("should deactivate session if currently active and handle error", async () => {
          mockSessionManager.get.mockResolvedValue({ status: "active" });
          mockBrowser.tabs.sendMessage.mockRejectedValue(new Error("Connection failed"));

          const response = await sendMessage({ type: MessageType.TOGGLE_SESSION });

          expect(mockBrowser.tabs.sendMessage).toHaveBeenCalledWith(mockTabId, {
            type: MessageType.RELEASE_LOCK,
          });
          expect(mockSessionManager.delete).toHaveBeenCalledWith(mockTabId);
          expect(updateBadge).toHaveBeenCalledWith(mockTabId, "inactive");
          expect(response).toEqual({ status: "inactive" });

          // Verify isProcessing is reset by attempting to toggle again
          mockSessionManager.get.mockResolvedValue({ status: "inactive" });
          const response2 = await sendMessage({ type: MessageType.TOGGLE_SESSION });

          expect(mockInjectContentScript).toHaveBeenCalledWith(mockTabId);
          expect(response2).toEqual({ status: "pending" });
        });
      });

      // New tests for Rules
      describe("ADD_RULE", () => {
        it("should add page rule", async () => {
          await sendMessage({
            type: MessageType.ADD_RULE,
            ruleType: "page",
            url: "https://example.com",
          });
          expect(mockRuleManager.addRule).toHaveBeenCalledWith("page", "https://example.com");
        });

        it("should add domain rule", async () => {
          await sendMessage({
            type: MessageType.ADD_RULE,
            ruleType: "domain",
            url: "https://example.com",
          });
          expect(mockRuleManager.addRule).toHaveBeenCalledWith("domain", "https://example.com");
        });
      });

      describe("REMOVE_RULE", () => {
        it("should remove page rule", async () => {
          await sendMessage({
            type: MessageType.REMOVE_RULE,
            ruleType: "page",
            url: "https://example.com",
          });
          expect(mockRuleManager.removeRule).toHaveBeenCalledWith("page", "https://example.com");
        });
      });

      describe("GET_RULE_FOR_TAB", () => {
        it("should return rule state", async () => {
          const ruleState = {
            hasPageRule: true,
            hasDomainRule: false,
            rootDomain: "example.com",
          } as any;
          mockRuleManager.getRuleState.mockResolvedValue(ruleState);

          const response = await sendMessage({ type: MessageType.GET_RULE_FOR_TAB });

          expect(mockRuleManager.getRuleState).toHaveBeenCalledWith("https://example.com");
          expect(response).toEqual({ ruleState });
        });

        it("should return no rule state if none matches", async () => {
          mockRuleManager.getRuleState.mockResolvedValue(null);
          const response = await sendMessage({ type: MessageType.GET_RULE_FOR_TAB });
          expect(response).toEqual({ ruleState: null });
        });
      });

      describe("GET_PERMISSION_FOR_TAB", () => {
        it("should return permission status", async () => {
          mockBrowser.permissions.contains.mockResolvedValue(true);
          const response = await sendMessage({ type: MessageType.GET_PERMISSION_FOR_TAB });

          expect(mockBrowser.permissions.contains).toHaveBeenCalledWith({
            origins: ["*://*.example.com/*"],
          });
          expect(response).toEqual(true);
        });
      });
    });

    describe("handleTabActivated", () => {
      it("should set lastActiveWebTabId if tab is http", async () => {
        const onActivated = mockBrowser.tabs.onActivated.addListener.mock.calls[0][0];

        mockBrowser.tabs.get.mockResolvedValue({ id: 999, url: "https://example.com" } as any);
        await onActivated({ tabId: 999, windowId: 1 });

        // Change active tab query to return an unsupported url
        mockBrowser.tabs.query.mockResolvedValue([{ url: "chrome://extensions" }] as Browser.tabs.Tab[]);

        // Now trigger GET_STATUS, which uses getActiveTabId()
        // If lastActiveWebTabId is 999, it will use 999, else it will return inactive
        mockSessionManager.get.mockResolvedValue({ status: "active" });

        const listener = (mockBrowser.runtime.onMessage.addListener as any).mock.calls[0][0];
        const response = await listener({ type: MessageType.GET_STATUS }, mockMessageSender, mockSendResponse);

        expect(mockSessionManager.get).toHaveBeenCalledWith(999);
        expect(response).toEqual({ status: "active" });
      });
    });

    describe("handleTabUpdated", () => {
      const triggerUpdate = async (status: string, url: string = "https://example.com") => {
        const onUpdated = mockBrowser.tabs.onUpdated.addListener.mock.calls[0][0];
        await onUpdated(mockTabId, { status: status as any }, { active: true, url } as any);
      };

      it("should auto-activate if rule matches and permission granted", async () => {
        mockRuleManager.getRuleState.mockResolvedValue({
          hasPageRule: true,
          hasDomainRule: false,
          rootDomain: "example.com",
        });
        mockBrowser.permissions.contains.mockResolvedValue(true);

        await triggerUpdate("complete");

        expect(mockInjectContentScript).toHaveBeenCalledWith(mockTabId);
      });

      it("should NOT activate if no rule matches", async () => {
        mockRuleManager.getRuleState.mockResolvedValue(null);

        await triggerUpdate("complete");

        expect(mockInjectContentScript).not.toHaveBeenCalled();
      });

      it("should set error if permission revoked", async () => {
        mockRuleManager.getRuleState.mockResolvedValue({
          hasPageRule: true,
          hasDomainRule: false,
          rootDomain: "example.com",
        });
        mockBrowser.permissions.contains.mockResolvedValue(false);

        await triggerUpdate("complete");

        expect(mockInjectContentScript).not.toHaveBeenCalled();
        expect(mockSessionManager.set).toHaveBeenCalledWith(mockTabId, "error", ErrorCode.PERMISSION_REQUIRED);
        expect(updateBadge).toHaveBeenCalledWith(mockTabId, "error");
      });

      it("should clear session on loading", async () => {
        await triggerUpdate("loading");
        expect(mockSessionManager.delete).toHaveBeenCalledWith(mockTabId);
      });
    });
  });
});
