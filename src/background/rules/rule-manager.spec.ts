import browser from "webextension-polyfill";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RuleManager } from "./rule-manager";

const mockBrowser = vi.mocked(browser, true);

describe("RuleManager", () => {
  let ruleManager: RuleManager;
  let storage: Record<string, any> = {};

  beforeEach(() => {
    ruleManager = new RuleManager();
    storage = {};

    mockBrowser.storage.local.get.mockImplementation(async (keys) => {
      if (typeof keys === "string") {
        return { [keys]: storage[keys] };
      }
      return storage;
    });

    mockBrowser.storage.local.set.mockImplementation(async (items) => {
      Object.assign(storage, items);
    });

    mockBrowser.storage.local.remove.mockImplementation(async (keys) => {
      if (typeof keys === "string") {
        delete storage[keys];
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => delete storage[key]);
      }
    });
  });

  describe("addPageRule", () => {
    it("should store page rule under root domain key", async () => {
      await ruleManager.addPageRule("https://example.com/recipe");

      expect(storage["rule:example.com"]).toBeDefined();
      expect(storage["rule:example.com"].isDomainWide).toBe(false);
      expect(storage["rule:example.com"].pages).toContain("https://example.com/recipe");
    });

    it("should store subdomain page rule under root domain key", async () => {
      await ruleManager.addPageRule("https://sub.example.com/page");

      expect(storage["rule:example.com"]).toBeDefined();
      expect(storage["rule:example.com"].pages).toContain("https://sub.example.com/page");
    });

    it("should add multiple pages under same domain", async () => {
      await ruleManager.addPageRule("https://example.com/a");
      await ruleManager.addPageRule("https://example.com/b");

      expect(storage["rule:example.com"].pages).toHaveLength(2);
    });

    it("should not duplicate same page URL", async () => {
      await ruleManager.addPageRule("https://example.com/a");
      await ruleManager.addPageRule("https://example.com/a");

      expect(storage["rule:example.com"].pages).toHaveLength(1);
    });

    it("should preserve isDomainWide when adding a page rule", async () => {
      await ruleManager.addDomainRule("https://example.com");
      await ruleManager.addPageRule("https://example.com/page");

      expect(storage["rule:example.com"].isDomainWide).toBe(true);
      expect(storage["rule:example.com"].pages).toContain("https://example.com/page");
    });

    it("should do nothing for invalid URL", async () => {
      await ruleManager.addPageRule("invalid-url");

      expect(Object.keys(storage)).toHaveLength(0);
    });
  });

  describe("addDomainRule", () => {
    it("should set isDomainWide and not clear pages", async () => {
      await ruleManager.addPageRule("https://example.com/page");
      await ruleManager.addDomainRule("https://example.com");

      expect(storage["rule:example.com"].isDomainWide).toBe(true);
      expect(storage["rule:example.com"].pages).toContain("https://example.com/page");
    });

    it("should work from subdomain URL", async () => {
      await ruleManager.addDomainRule("https://sub.example.com");

      expect(storage["rule:example.com"].isDomainWide).toBe(true);
    });
  });

  describe("removePageRule", () => {
    it("should remove specific page and delete key if empty", async () => {
      await ruleManager.addPageRule("https://example.com/page");
      await ruleManager.removePageRule("https://example.com/page");

      expect(storage["rule:example.com"]).toBeUndefined();
    });

    it("should keep entry if other pages remain", async () => {
      await ruleManager.addPageRule("https://example.com/a");
      await ruleManager.addPageRule("https://example.com/b");
      await ruleManager.removePageRule("https://example.com/a");

      expect(storage["rule:example.com"].pages).toEqual(["https://example.com/b"]);
    });
  });

  describe("removeDomainRule", () => {
    it("should unset isDomainWide and delete key if no pages", async () => {
      await ruleManager.addDomainRule("https://example.com");
      await ruleManager.removeDomainRule("https://example.com");

      expect(storage["rule:example.com"]).toBeUndefined();
    });
  });

  describe("addRule / removeRule dispatching", () => {
    it('should dispatch addRule type="page" to addPageRule', async () => {
      const spy = vi.spyOn(ruleManager, "addPageRule");
      await ruleManager.addRule("page", "https://example.com/page");
      expect(spy).toHaveBeenCalledWith("https://example.com/page");
    });

    it('should dispatch addRule type="domain" to addDomainRule', async () => {
      const spy = vi.spyOn(ruleManager, "addDomainRule");
      await ruleManager.addRule("domain", "https://example.com");
      expect(spy).toHaveBeenCalledWith("https://example.com");
    });

    it('should dispatch removeRule type="page" to removePageRule', async () => {
      const spy = vi.spyOn(ruleManager, "removePageRule");
      await ruleManager.removeRule("page", "https://example.com/page");
      expect(spy).toHaveBeenCalledWith("https://example.com/page");
    });

    it('should dispatch removeRule type="domain" to removeDomainRule', async () => {
      const spy = vi.spyOn(ruleManager, "removeDomainRule");
      await ruleManager.removeRule("domain", "https://example.com");
      expect(spy).toHaveBeenCalledWith("https://example.com");
    });
  });

  describe("getRuleState", () => {
    it("should match exact page URL", async () => {
      await ruleManager.addPageRule("https://example.com/recipe");

      const state = await ruleManager.getRuleState("https://example.com/recipe");
      expect(state).toEqual({ hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" });
    });

    it("should NOT match different page URL", async () => {
      await ruleManager.addPageRule("https://example.com/recipe");

      const state = await ruleManager.getRuleState("https://example.com/other");
      expect(state).toBeNull();
    });

    it("should match domain rule", async () => {
      await ruleManager.addDomainRule("https://example.com");

      const state = await ruleManager.getRuleState("https://example.com/anything");
      expect(state).toEqual({ hasPageRule: false, hasDomainRule: true, rootDomain: "example.com" });
    });

    it("should match subdomain with domain rule", async () => {
      await ruleManager.addDomainRule("https://example.com");

      const state = await ruleManager.getRuleState("https://sub.example.com/anything");
      expect(state).toEqual({ hasPageRule: false, hasDomainRule: true, rootDomain: "example.com" });
    });

    it("should match subdomain page rule", async () => {
      await ruleManager.addPageRule("https://sub.example.com/page");

      const state = await ruleManager.getRuleState("https://sub.example.com/page");
      expect(state).toEqual({ hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" });
    });

    it("should handle co.uk domain rule", async () => {
      await ruleManager.addDomainRule("https://site.co.uk");

      const state = await ruleManager.getRuleState("https://sub.site.co.uk/page");
      expect(state).toEqual({ hasPageRule: false, hasDomainRule: true, rootDomain: "site.co.uk" });
    });

    it("should return null for non-http URLs", async () => {
      const state = await ruleManager.getRuleState("chrome://extensions");
      expect(state).toBeNull();
    });

    it("should return null for unregistered domain", async () => {
      const state = await ruleManager.getRuleState("https://other.com/page");
      expect(state).toBeNull();
    });

    it("should return both flags when both exist", async () => {
      storage["rule:example.com"] = {
        isDomainWide: true,
        pages: ["https://example.com/page"],
        createdAt: Date.now(),
      };

      const state = await ruleManager.getRuleState("https://example.com/page");
      expect(state).toEqual({ hasPageRule: true, hasDomainRule: true, rootDomain: "example.com" });
    });
  });
});
