import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WakeError } from "./wake-error";
import { ErrorCode } from "../../types";

describe("WakeError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if errorMsg is null", () => {
    const { container } = render(<WakeError errorMsg={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null if errorMsg is PERMISSION_REQUIRED", () => {
    const { container } = render(<WakeError errorMsg={ErrorCode.PERMISSION_REQUIRED} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render SYSTEM_BLOCKED error", () => {
    render(<WakeError errorMsg={ErrorCode.SYSTEM_BLOCKED} />);

    expect(screen.getByText("Blocked by device settings")).toBeDefined();
    expect(screen.getByText(/Your phone's Battery Saver or Low Power Mode/)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render NOT_SECURE error", () => {
    render(<WakeError errorMsg={ErrorCode.NOT_SECURE} />);

    expect(screen.getByText("Secure connection required")).toBeDefined();
    expect(screen.getByText(/For security, your browser only allows the screen to stay awake/)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render NOT_SUPPORTED error", () => {
    render(<WakeError errorMsg={ErrorCode.NOT_SUPPORTED} />);

    expect(screen.getByText("Not supported here")).toBeDefined();
    expect(screen.getByText(/Your current browser or device does not support the feature/)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render UNKNOWN error properly", () => {
    render(<WakeError errorMsg={ErrorCode.UNKNOWN} />);

    expect(screen.getByText("Caffeine failed to activate")).toBeDefined();
    expect(screen.getByText(ErrorCode.UNKNOWN)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render string fallback properly", () => {
    render(<WakeError errorMsg="Some arbitrary error" />);

    expect(screen.getByText("Caffeine failed to activate")).toBeDefined();
    expect(screen.getByText("Some arbitrary error")).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });
});
