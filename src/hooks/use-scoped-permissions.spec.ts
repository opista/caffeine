import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "../test/utils";
import { act } from "react";
import { useScopedPermissions } from "./use-scoped-permissions";
import browser from "webextension-polyfill";

const mockBrowser = vi.mocked(browser, true);

describe("useScopedPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowser.runtime.sendMessage.mockResolvedValue(true);
    mockBrowser.permissions.request.mockResolvedValue(true);
    vi.stubGlobal("close", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should fetch scoped permissions on mount", async () => {
    const testUrl = new URL("https://example.com/page");
    const { result } = renderHook(() => useScopedPermissions(testUrl));

    await vi.waitUntil(() => result.current.hasScopedPermission === true);

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: "GET_PERMISSION_FOR_TAB",
    });
  });

  it("should request scoped permission", async () => {
    const testUrl = new URL("https://example.com/page");
    const { result } = renderHook(() => useScopedPermissions(testUrl));

    await vi.waitUntil(() => result.current.hasScopedPermission === true);

    await act(() => result.current.requestScopedPermission("https://example.com/page"));

    expect(mockBrowser.permissions.request).toHaveBeenCalledWith({
      origins: ["*://*.example.com/*"],
    });
    expect(window.close).toHaveBeenCalled();
  });
});
