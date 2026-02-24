import { describe, it, expect, vi, Mock, beforeEach } from "vitest";
import browser from "webextension-polyfill";
import { WakeToggle } from "./wake-toggle";
import { useActiveTab } from "../hooks/use-active-tab";
import { usePlatform } from "../hooks/use-platform";
import { useWakeLock } from "../hooks/use-wake-lock";
import { render, screen, fireEvent } from "@testing-library/react";

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
    render(<WakeToggle />);

    expect(screen.getByText("Wake Lock is Inactive")).toBeTruthy();
    expect(screen.getByText("Tap to keep screen awake")).toBeTruthy();

    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.checked).toBe(false);
    expect(input.getAttribute("aria-checked")).toBe("false");

    // Check styling for inactive state (not active, not pending)
    const card = input.closest("label");
    expect(card?.className).toContain("shadow-slate-200/50");
    expect(card?.className).not.toContain("shadow-brand/10");
  });

  it("renders correctly in active state", () => {
    (useWakeLock as Mock).mockReturnValue({
      status: "active",
      errorMsg: null,
      toggleSession: mockToggleSession,
    });

    render(<WakeToggle />);

    expect(screen.getByText("Wake Lock is Active")).toBeTruthy();
    expect(screen.getByText("Preventing sleep automatically")).toBeTruthy();

    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(input.getAttribute("aria-checked")).toBe("true");

    // Check styling for active state
    const card = input.closest("label");
    expect(card?.className).toContain("shadow-brand/10");
  });

  it("renders correctly in pending state", () => {
    (useWakeLock as Mock).mockReturnValue({
      status: "pending",
      errorMsg: null,
      toggleSession: mockToggleSession,
    });

    render(<WakeToggle />);

    expect(screen.getByText("Activating...")).toBeTruthy();

    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    // Check styling for pending state
    const card = input.closest("label");
    expect(card?.className).toContain("shadow-amber-200/50");
  });

  it("renders correctly when URL is unsupported", () => {
    (useActiveTab as Mock).mockReturnValue({
      isSupportedUrl: false,
    });

    render(<WakeToggle />);

    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    // Check styling for unsupported state
    const card = input.closest("label");
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

    render(<WakeToggle />);

    expect(screen.getAllByText("System prevented Wake Lock").length).toBe(2);
    expect(screen.getByText(errorMsg)).toBeTruthy();

    // Check "Fix Issue" button exists
    const fixButton = screen.getByRole("button", { name: /Fix Issue/i });
    expect(fixButton).toBeDefined();
  });

  it("calls toggleSession when clicked", () => {
    render(<WakeToggle />);

    const input = screen.getByRole("switch");
    fireEvent.click(input);

    expect(mockToggleSession).toHaveBeenCalledTimes(1);
  });

  it('calls browser.tabs.create when "Fix Issue" is clicked', () => {
    (useWakeLock as Mock).mockReturnValue({
      status: "error",
      errorMsg: "Some error",
      toggleSession: mockToggleSession,
    });

    render(<WakeToggle />);

    const fixButton = screen.getByRole("button", { name: /Fix Issue/i });
    fireEvent.click(fixButton);

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
