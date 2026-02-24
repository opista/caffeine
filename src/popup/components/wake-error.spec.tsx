import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import browser from "webextension-polyfill";
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

  it("should render SYSTEM_BLOCKED error with fix button", () => {
    render(<WakeError errorMsg={ErrorCode.SYSTEM_BLOCKED} />);

    expect(screen.getByText("System prevented Wake Lock")).toBeDefined();
    expect(screen.getByText("Check your OS battery settings or power saving mode.")).toBeDefined();

    const button = screen.getByRole("button", { name: /Fix Issue/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API",
    });
  });

  it("should render NOT_SECURE error without fix button", () => {
    render(<WakeError errorMsg={ErrorCode.NOT_SECURE} />);

    expect(screen.getByText("Secure Connection Required")).toBeDefined();
    expect(screen.getByText("Wake Lock can only be active on secure HTTPS pages.")).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render NOT_SUPPORTED error without fix button", () => {
    render(<WakeError errorMsg={ErrorCode.NOT_SUPPORTED} />);

    expect(screen.getByText("Browser Not Supported")).toBeDefined();
    expect(screen.getByText("Your browser doesn't support the Wake Lock API.")).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render UNKNOWN error properly", () => {
    render(<WakeError errorMsg={ErrorCode.UNKNOWN} />);

    expect(screen.getByText("Wake Lock failed to activate")).toBeDefined();
    expect(screen.getByText(ErrorCode.UNKNOWN)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });

  it("should render string fallback properly", () => {
    render(<WakeError errorMsg="Some arbitrary error" />);

    expect(screen.getByText("Wake Lock failed to activate")).toBeDefined();
    expect(screen.getByText("Some arbitrary error")).toBeDefined();
    expect(screen.queryByRole("button", { name: /Fix Issue/i })).toBeNull();
  });
});
