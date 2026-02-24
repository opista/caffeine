import { describe, it, expect, vi, Mock, beforeEach } from "vitest";
import { act } from "react";
import browser from "webextension-polyfill";
import { WakeToggle } from "./wake-toggle";
import { useActiveTab } from "../../hooks/use-active-tab";
import { usePlatform } from "../../hooks/use-platform";
import { useWakeLock } from "../../hooks/use-wake-lock";
import { render } from "../../test/utils";

// Mock hooks
vi.mock("../../hooks/use-active-tab");
vi.mock("../../hooks/use-platform");
vi.mock("../../hooks/use-wake-lock");

describe("WakeToggle", () => {
  const mockToggleSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useActiveTab as Mock).mockReturnValue({
      isSupportedUrl: true,
    });

    (usePlatform as Mock).mockReturnValue({
      isAndroid: false,
    });

    (useWakeLock as Mock).mockReturnValue({
      status: "inactive",
      errorMsg: null,
      toggleSession: mockToggleSession,
    });
  });

  it("renders correctly in inactive state", () => {
    const { container } = render(<WakeToggle />);

    expect(container.textContent).toContain("Wake Lock is Inactive");
    expect(container.textContent).toContain("Tap to keep screen awake");

    const input = container.querySelector("input");
    expect(input).toBeDefined();
    expect(input?.checked).toBe(false);
    expect(input?.getAttribute("aria-checked")).toBe("false");
    expect(input?.getAttribute("role")).toBe("switch");

    // Check styling for inactive state (not active, not pending)
    const card = container.querySelector("label");
    expect(card?.className).toContain("shadow-slate-200/50");
    expect(card?.className).not.toContain("shadow-brand/10");
  });

  it("renders correctly in active state", () => {
    (useWakeLock as Mock).mockReturnValue({
      status: "active",
      errorMsg: null,
      toggleSession: mockToggleSession,
    });

    const { container } = render(<WakeToggle />);

    expect(container.textContent).toContain("Wake Lock is Active");
    expect(container.textContent).toContain("Preventing sleep automatically");

    const input = container.querySelector("input");
    expect(input?.checked).toBe(true);
    expect(input?.getAttribute("aria-checked")).toBe("true");

    // Check styling for active state
    const card = container.querySelector("label");
    expect(card?.className).toContain("shadow-brand/10");
  });

  it("renders correctly in pending state", () => {
    (useWakeLock as Mock).mockReturnValue({
      status: "pending",
      errorMsg: null,
      toggleSession: mockToggleSession,
    });

    const { container } = render(<WakeToggle />);

    expect(container.textContent).toContain("Activating...");

    const input = container.querySelector("input");
    expect(input?.disabled).toBe(true);

    // Check styling for pending state
    const card = container.querySelector("label");
    expect(card?.className).toContain("shadow-amber-200/50");
  });

  it("renders correctly when URL is unsupported", () => {
    (useActiveTab as Mock).mockReturnValue({
      isSupportedUrl: false,
    });

    const { container } = render(<WakeToggle />);

    const input = container.querySelector("input");
    expect(input?.disabled).toBe(true);

    // Check styling for unsupported state
    const card = container.querySelector("label");
    expect(card?.className).toContain("opacity-60");
    expect(card?.className).toContain("cursor-not-allowed");
  });

  it("renders error message when status is error", () => {
    const errorMsg = "Battery saver mode enabled";
    (useWakeLock as Mock).mockReturnValue({
      status: "error",
      errorMsg: errorMsg,
      toggleSession: mockToggleSession,
    });

    const { container } = render(<WakeToggle />);

    expect(container.textContent).toContain("System prevented Wake Lock");
    expect(container.textContent).toContain(errorMsg);

    // Check "Fix Issue" button exists
    const fixButton = container.querySelector("button");
    expect(fixButton).toBeDefined();
    expect(fixButton?.textContent).toContain("Fix Issue");
  });

  it("calls toggleSession when clicked", () => {
    const { container } = render(<WakeToggle />);

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    act(() => {
      input!.click();
    });

    expect(mockToggleSession).toHaveBeenCalledTimes(1);
  });

  it('calls browser.tabs.create when "Fix Issue" is clicked', () => {
    (useWakeLock as Mock).mockReturnValue({
      status: "error",
      errorMsg: "Some error",
      toggleSession: mockToggleSession,
    });

    const { container } = render(<WakeToggle />);

    const fixButton = container.querySelector("button");
    expect(fixButton).not.toBeNull();
    act(() => {
      fixButton!.click();
    });

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API",
    });
  });

  it("passes isAndroid correctly to useWakeLock", () => {
    (usePlatform as Mock).mockReturnValue({
      isAndroid: true,
    });

    render(<WakeToggle />);

    expect(useWakeLock).toHaveBeenCalledWith(true);
  });
});
