import browser from "webextension-polyfill";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { updateBadge } from "./update-badge";
import { LockStatus } from "../types";
import { getOperatingSystem } from "./get-operating-system";

const mockBrowser = vi.mocked(browser, true);

vi.mock("./get-operating-system");

const mockGetOperatingSystem = vi.mocked(getOperatingSystem);

describe("updateBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    if (color) {
      expect(mockBrowser.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color,
        tabId,
      });
    } else {
      expect(mockBrowser.action.setBadgeBackgroundColor).not.toHaveBeenCalled();
    }
  });
});
