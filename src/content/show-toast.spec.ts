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

    const toast = host?.shadowRoot?.querySelector("div");
    expect(toast?.textContent).toBe("Success Message");
    expect(toast?.style.background).toBe("rgb(46, 204, 113)"); // #2ecc71
  });

  it("should show error toast with red background", () => {
    showToast("Error Message", "error");

    const host = document.getElementById("caffeine-toast-root");
    const toast = host?.shadowRoot?.querySelector("div");
    expect(toast?.style.background).toBe("rgb(231, 76, 60)"); // #e74c3c
  });

  it("should remove existing toast before showing a new one", () => {
    showToast("First Toast");
    const firstHost = document.getElementById("caffeine-toast-root");

    showToast("Second Toast");
    const secondHost = document.getElementById("caffeine-toast-root");

    expect(document.body.children.length).toBe(1);
    expect(firstHost).not.toBe(secondHost);
    expect(secondHost?.shadowRoot?.querySelector("div")?.textContent).toBe("Second Toast");
  });

  it("should animate in using requestAnimationFrame", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    showToast("Animate Me");

    expect(rafSpy).toHaveBeenCalled();

    const host = document.getElementById("caffeine-toast-root");
    const toast = host?.shadowRoot?.querySelector("div");

    // Initial state before RAF
    expect(toast?.style.opacity).toBe("0");

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

    const toast = host?.shadowRoot?.querySelector("div");
    expect(toast?.style.opacity).toBe("0");

    // Advance timers by another 300ms for the removal
    vi.advanceTimersByTime(300);

    expect(document.getElementById("caffeine-toast-root")).toBeNull();
  });
});
