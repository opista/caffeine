import { describe, it, expect, vi, beforeEach } from "vitest";
import browser from "webextension-polyfill";
import { useActiveTab } from "./use-active-tab";
import { renderHook } from "@testing-library/react";

const mockBrowser = vi.mocked(browser, true);

describe("useActiveTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return hostname, URL object and isSupportedUrl=true for valid https url", async () => {
    mockBrowser.tabs.query.mockResolvedValue([{ url: "https://www.example.com/path" }] as browser.Tabs.Tab[]);
    const { result } = renderHook(() => useActiveTab());

    await vi.waitFor(() => {
      expect(result.current.hostname).toBe("www.example.com");
      expect(result.current.isSupportedUrl).toBe(true);
      expect(result.current.url).toBeInstanceOf(URL);
      expect(result.current.url?.href).toBe("https://www.example.com/path");
    });
  });

  it("should return hostname and url=null for http url", async () => {
    mockBrowser.tabs.query.mockResolvedValue([{ url: "http://www.example.com/path" }] as browser.Tabs.Tab[]);
    const { result } = renderHook(() => useActiveTab());

    await vi.waitFor(() => {
      expect(result.current.hostname).toBe("www.example.com");
      expect(result.current.url).toBeNull();
      expect(result.current.isSupportedUrl).toBe(false);
    });
  });

  it("should return Unknown Page when URL parsing fails", async () => {
    mockBrowser.tabs.query.mockResolvedValue([{ url: "httpbutwillfail" }] as browser.Tabs.Tab[]);
    const { result } = renderHook(() => useActiveTab());

    await vi.waitFor(() => {
      expect(result.current.hostname).toBe("Unknown Page");
      expect(result.current.url).toBeNull();
      expect(result.current.isSupportedUrl).toBe(false);
    });
  });

  it("should return Unsupported Page for non-http url", async () => {
    mockBrowser.tabs.query.mockResolvedValue([{ url: "chrome://extensions" }] as browser.Tabs.Tab[]);
    const { result } = renderHook(() => useActiveTab());

    await vi.waitFor(() => {
      expect(result.current.hostname).toBe("Unsupported Page");
      expect(result.current.url).toBeNull();
      expect(result.current.isSupportedUrl).toBe(false);
    });
  });

  it("should return Unsupported Page if no active tab found", async () => {
    mockBrowser.tabs.query.mockResolvedValue([] as browser.Tabs.Tab[]);
    const { result } = renderHook(() => useActiveTab());

    await vi.waitFor(() => {
      expect(result.current.hostname).toBe("Unsupported Page");
      expect(result.current.url).toBeNull();
      expect(result.current.isSupportedUrl).toBe(false);
    });
  });
});
