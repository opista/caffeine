import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { showToast } from "./show-toast";

describe("showToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a toast element with correctly set properties", () => {
    showToast("Success Message", "success");

    const host = document.getElementById("caffeine-toast-root");
    expect(host).toBeTruthy();
    expect(host?.style.position).toBe("fixed");
    expect(host?.shadowRoot).toBeTruthy();

    const toast = host?.shadowRoot?.querySelector(".toast");
    expect(toast?.querySelector("span")?.textContent).toBe("Success Message");
    expect(toast?.querySelector(".icon")).toBeTruthy();
  });

  it("should show error toast with icon", () => {
    showToast("Error Message", "error");

    const host = document.getElementById("caffeine-toast-root");
    const toast = host?.shadowRoot?.querySelector(".toast");
    expect(toast?.querySelector(".icon")).toBeTruthy();
  });

  it("should remove existing toast before showing a new one", () => {
    showToast("First Toast");
    const firstHost = document.getElementById("caffeine-toast-root");

    showToast("Second Toast");
    const secondHost = document.getElementById("caffeine-toast-root");

    expect(document.body.children.length).toBe(1);
    expect(firstHost).not.toBe(secondHost);
    expect(secondHost?.shadowRoot?.querySelector("span")?.textContent).toBe("Second Toast");
  });

  it("should animate in using requestAnimationFrame", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    showToast("Animate Me");

    expect(rafSpy).toHaveBeenCalled();

    const host = document.getElementById("caffeine-toast-root");
    const toast = host?.shadowRoot?.querySelector(".toast") as HTMLElement;

    // Initial state before RAF (inline style should be empty, but we set it in CSS)
    expect(toast?.style.opacity).toBe("");

    // Execute RAF callback
    const callback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
    callback(0);

    expect(toast?.style.opacity).toBe("1");
    expect(toast?.style.transform).toBe("translateY(0)");
  });

  it("should auto-dismiss after 3 seconds", () => {
    showToast("Auto Dismiss");

    const host = document.getElementById("caffeine-toast-root");
    expect(document.body.contains(host)).toBe(true);

    // Advance timers by 3 seconds
    vi.advanceTimersByTime(3000);

    const toast = host?.shadowRoot?.querySelector(".toast") as HTMLElement;
    expect(toast?.style.opacity).toBe("0");

    // Advance timers by another 400ms for the removal
    vi.advanceTimersByTime(400);

    expect(document.getElementById("caffeine-toast-root")).toBeNull();
  });
});
