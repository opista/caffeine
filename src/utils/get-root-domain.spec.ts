import { describe, it, expect } from "vitest";
import { getRootDomain } from "./get-root-domain";

describe("getRootDomain", () => {
  it("should return root domain for standard domains", () => {
    expect(getRootDomain("https://www.example.com/path")).toBe("example.com");
    expect(getRootDomain("https://sub.example.com/path")).toBe("example.com");
  });

  it("should return root domain for multi-level subdomains", () => {
    expect(getRootDomain("https://www.sub.example.com/path")).toBe("example.com");
    expect(getRootDomain("https://www.sub.sub.example.com/path")).toBe("example.com");
  });

  it("should handle multi-level TLDs", () => {
    expect(getRootDomain("https://www.example.co.uk/")).toBe("example.co.uk");
  });

  it("should return null for invalid domains", () => {
    expect(getRootDomain("https://localhost/")).toBe(null);
  });

  it("should return null for invalid URL string", () => {
    expect(getRootDomain("invalid-url")).toBe(null);
  });
});
