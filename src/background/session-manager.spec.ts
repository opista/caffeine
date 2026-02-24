import browser from "webextension-polyfill";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SessionManager } from "./session-manager";

const mockBrowser = vi.mocked(browser, true);

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let storage: Record<string, any> = {};

  beforeEach(() => {
    sessionManager = new SessionManager();
    storage = {};

    mockBrowser.storage.session.get.mockImplementation(async (keys) => {
      if (typeof keys === "string") {
        return { [keys]: storage[keys] };
      }
      if (Array.isArray(keys)) {
        return keys.reduce((acc, key) => ({ ...acc, [key]: storage[key] }), {});
      }
      return storage;
    });

    mockBrowser.storage.session.set.mockImplementation(async (items) => {
      Object.assign(storage, items);
    });

    mockBrowser.storage.session.remove.mockImplementation(async (keys) => {
      if (typeof keys === "string") {
        delete storage[keys];
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => delete storage[key]);
      }
    });
  });

  describe("set", () => {
    it("should store session status", async () => {
      await sessionManager.set(1, "active");
      expect(await sessionManager.get(1)).toEqual({ status: "active" });
      expect(mockBrowser.storage.session.set).toHaveBeenCalledWith({
        "1": { status: "active", error: undefined },
      });
    });

    it("should update existing session", async () => {
      await sessionManager.set(1, "active");
      await sessionManager.set(1, "inactive");
      expect(await sessionManager.get(1)).toEqual({ status: "inactive" });
    });
  });

  describe("get", () => {
    it('should return "inactive" for unknown session', async () => {
      expect(await sessionManager.get(999)).toEqual({ status: "inactive" });
    });

    it("should return stored status", async () => {
      await sessionManager.set(1, "active");
      expect(await sessionManager.get(1)).toEqual({ status: "active" });
    });
  });

  describe("delete", () => {
    it("should delete session", async () => {
      await sessionManager.set(1, "active");
      await sessionManager.delete(1);
      expect(await sessionManager.get(1)).toEqual({ status: "inactive" });
      expect(await sessionManager.has(1)).toBe(false);
      expect(mockBrowser.storage.session.remove).toHaveBeenCalledWith("1");
    });

    it("should handle deleting non-existent session", async () => {
      await expect(sessionManager.delete(999)).resolves.not.toThrow();
    });
  });

  describe("has", () => {
    it("should check if session exists", async () => {
      await sessionManager.set(1, "active");
      expect(await sessionManager.has(1)).toBe(true);
      expect(await sessionManager.has(999)).toBe(false);
    });
  });
});
