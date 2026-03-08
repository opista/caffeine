import { describe, it, expect } from "vitest";
import { getErrorName } from "./get-error-name";

describe("getErrorName", () => {
  it("should return the name of an Error instance", () => {
    const error = new Error("Test error");
    error.name = "CustomErrorName";
    expect(getErrorName(error)).toBe("CustomErrorName");
  });

  it("should return the name of a DOMException", () => {
    const error = new DOMException("Test error", "NotAllowedError");
    expect(getErrorName(error)).toBe("NotAllowedError");
  });

  it("should return the name property of a plain object if it is a string", () => {
    const error = { name: "NotSupportedError", message: "Not supported" };
    expect(getErrorName(error)).toBe("NotSupportedError");
  });

  it("should return undefined for a plain object without a name property", () => {
    const error = { message: "Test error" };
    expect(getErrorName(error)).toBeUndefined();
  });

  it("should return undefined for a plain object with a non-string name property", () => {
    const error = { name: 123, message: "Test error" };
    expect(getErrorName(error)).toBeUndefined();
  });

  it("should return undefined for null", () => {
    expect(getErrorName(null)).toBeUndefined();
  });

  it("should return undefined for a string primitive", () => {
    expect(getErrorName("Just a string")).toBeUndefined();
  });

  it("should return undefined for undefined", () => {
    expect(getErrorName(undefined)).toBeUndefined();
  });

  it("should return undefined for a number primitive", () => {
    expect(getErrorName(404)).toBeUndefined();
  });
});
