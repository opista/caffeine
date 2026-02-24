import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRules } from "./use-rules";
import { MessageType } from "../../../types";
import { sendExtensionMessage } from "../utils/send-extension-message";

vi.mock("../utils/send-extension-message");

const mockSendExtensionMessage = vi.mocked(sendExtensionMessage);

describe("useRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendExtensionMessage.mockResolvedValue({ ruleState: null });
    vi.stubGlobal("close", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should fetch rules on mount", async () => {
    renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => mockSendExtensionMessage.mock.calls.length > 0);

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({ type: MessageType.GET_RULE_FOR_TAB });
  });

  it("should toggle page rule: add if missing", async () => {
    mockSendExtensionMessage.mockResolvedValue({ ruleState: null });
    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await result.current.togglePageRule("https://example.com/page");

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({
      type: MessageType.ADD_RULE,
      ruleType: "page",
      url: "https://example.com/page",
    });
  });

  it("should toggle page rule: remove if exists", async () => {
    mockSendExtensionMessage.mockResolvedValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" },
    });

    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => result.current.ruleState?.hasPageRule === true);

    await result.current.togglePageRule("https://example.com/page");

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({
      type: MessageType.REMOVE_RULE,
      ruleType: "page",
      url: "https://example.com/page",
    });
  });

  it("should toggle domain rule: add if missing", async () => {
    mockSendExtensionMessage.mockResolvedValue({ ruleState: null });
    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await result.current.toggleDomainRule("https://example.com/page");

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({
      type: MessageType.ADD_RULE,
      ruleType: "domain",
      url: "https://example.com/page",
    });
  });

  it("should toggle domain rule: remove if exists", async () => {
    mockSendExtensionMessage.mockResolvedValue({
      ruleState: { hasPageRule: false, hasDomainRule: true, rootDomain: "example.com" },
    });

    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => result.current.ruleState?.hasDomainRule === true);

    await result.current.toggleDomainRule("https://example.com/page");

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({
      type: MessageType.REMOVE_RULE,
      ruleType: "domain",
      url: "https://example.com/page",
    });
  });

  it("should toggle page rule independently of domain rule", async () => {
    mockSendExtensionMessage.mockResolvedValue({
      ruleState: { hasPageRule: true, hasDomainRule: true, rootDomain: "example.com" },
    });

    const { result } = renderHook(() => useRules(new URL("https://example.com/page")));

    await vi.waitUntil(() => result.current.ruleState?.hasPageRule === true);
    await vi.waitUntil(() => result.current.ruleState?.hasDomainRule === true);

    await result.current.togglePageRule("https://example.com/page");

    expect(mockSendExtensionMessage).toHaveBeenCalledWith({
      type: MessageType.REMOVE_RULE,
      ruleType: "page",
      url: "https://example.com/page",
    });
  });
});
