import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "../test/utils";
import { useRules } from "./use-rules";
import browser from "webextension-polyfill";
import { MessageType } from "../types";

const mockBrowser = vi.mocked(browser, true);

describe("useRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowser.runtime.sendMessage.mockResolvedValue({ ruleState: null });
    vi.stubGlobal("close", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should fetch rules on mount", async () => {
    renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => mockBrowser.runtime.sendMessage.mock.calls.length > 0);

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({ type: MessageType.GET_RULE_FOR_TAB });
  });

  it("should toggle page rule: add if missing", async () => {
    mockBrowser.runtime.sendMessage.mockResolvedValue({ ruleState: null });
    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await result.current.togglePageRule("https://example.com/page");

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.ADD_RULE,
      ruleType: "page",
      url: "https://example.com/page",
    });
  });

  it("should toggle page rule: remove if exists", async () => {
    mockBrowser.runtime.sendMessage.mockResolvedValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" },
    });

    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => result.current.ruleState?.hasPageRule === true);

    await result.current.togglePageRule("https://example.com/page");

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.REMOVE_RULE,
      ruleType: "page",
      url: "https://example.com/page",
    });
  });

  it("should toggle domain rule: add if missing", async () => {
    mockBrowser.runtime.sendMessage.mockResolvedValue({ ruleState: null });
    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await result.current.toggleDomainRule("https://example.com/page");

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.ADD_RULE,
      ruleType: "domain",
      url: "https://example.com/page",
    });
  });

  it("should toggle domain rule: remove if exists", async () => {
    mockBrowser.runtime.sendMessage.mockResolvedValue({
      ruleState: { hasPageRule: false, hasDomainRule: true, rootDomain: "example.com" },
    });

    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => result.current.ruleState?.hasDomainRule === true);

    await result.current.toggleDomainRule("https://example.com/page");

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.REMOVE_RULE,
      ruleType: "domain",
      url: "https://example.com/page",
    });
  });

  it("should toggle page rule independently of domain rule", async () => {
    mockBrowser.runtime.sendMessage.mockResolvedValue({
      ruleState: { hasPageRule: true, hasDomainRule: true, rootDomain: "example.com" },
    });

    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => result.current.ruleState?.hasPageRule === true);
    await vi.waitUntil(() => result.current.ruleState?.hasDomainRule === true);

    await result.current.togglePageRule("https://example.com/page");

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: MessageType.REMOVE_RULE,
      ruleType: "page",
      url: "https://example.com/page",
    });
  });
});
