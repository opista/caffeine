import browser from "webextension-polyfill";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { updateBadge } from "./update-badge";
import { LockStatus } from "../types";
import { getOperatingSystem } from "./get-operating-system";

vi.mock("./get-operating-system");

const mockBrowser = vi.mocked(browser, true);
const mockGetOperatingSystem = vi.mocked(getOperatingSystem);

describe("updateBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return early if tabId is <= 0", async () => {
    await updateBadge(-1, "active");
    expect(mockBrowser.action.setBadgeText).not.toHaveBeenCalled();
  });

  it.each([
    { status: "active", os: "mac", text: "ON", color: "#2ecc71" },
    { status: "active", os: "android", text: "ACTIVE", color: "#2ecc71" },
    { status: "pending", os: "mac", text: "", color: "#f39c12" },
    { status: "pending", os: "android", text: "PENDING", color: "#f39c12" },
    { status: "error", os: "mac", text: "ERR", color: "#e74c3c" },
    { status: "error", os: "android", text: "ERROR", color: "#e74c3c" },
    { status: "inactive", os: "mac", text: "", color: undefined },
    { status: "inactive", os: "android", text: "OFF", color: undefined },
    { status: "unknown", os: "mac", text: "", color: undefined },
  ])("should update badge correctly for status: $status on $os", async ({ status, os, text, color }) => {
    const tabId = 123;
    mockGetOperatingSystem.mockResolvedValue(os as browser.Runtime.PlatformOs);
    await updateBadge(tabId, status as LockStatus);

    expect(mockBrowser.action.setBadgeText).toHaveBeenCalledWith({
      text,
      tabId,
    });

    expect(vi.mocked(mockBrowser.action.setBadgeBackgroundColor).mock.calls).toEqual(color ? [[{ color, tabId }]] : []);
  });
});
