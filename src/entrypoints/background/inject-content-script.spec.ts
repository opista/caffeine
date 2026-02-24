import { vi, describe, it, expect, beforeEach } from "vitest";
import { injectContentScript } from "./inject-content-script";
import { browser } from "wxt/browser";

const mockBrowser = vi.mocked(browser);

describe("injectContentScript", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call executeScript with correct parameters", async () => {
    const tabId = 123;
    mockBrowser.scripting.executeScript.mockResolvedValue([]);

    await injectContentScript(tabId);

    expect(mockBrowser.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId },
      files: ["/contents.js"],
    });
  });

  it("should return the result of executeScript", async () => {
    const tabId = 123;
    const mockResult = [{ result: "success" }] as any;
    mockBrowser.scripting.executeScript.mockResolvedValue(mockResult);

    const result = await injectContentScript(tabId);

    expect(result).toBe(mockResult);
  });
});
