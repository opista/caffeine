import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("should handle conditional classes", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("flex", true && "items-center", false && "justify-center")).toBe("flex items-center");
  });

  it("should handle objects with conditional classes", () => {
    expect(cn("flex", { "items-center": true, "justify-center": false })).toBe("flex items-center");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["flex", "items-center"], ["justify-center"])).toBe("flex items-center justify-center");
  });

  it("should handle falsy values correctly", () => {
    expect(cn("flex", null, undefined, false, 0)).toBe("flex");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
  });

  it("should handle complex nested structures", () => {
    expect(cn("base", ["nested-1", { "nested-2": true, "nested-3": false }], "final")).toBe(
      "base nested-1 nested-2 final",
    );
  });
});
