import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendExtensionMessage } from "./send-extension-message";
import { browser } from "wxt/browser";
import { ExtensionMessage, MessageType } from "../../../types";

describe("sendExtensionMessage", () => {
  const message: ExtensionMessage = { type: MessageType.GET_STATUS };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a message using browser.runtime.sendMessage and return the response", async () => {
    vi.mocked(browser.runtime.sendMessage).mockResolvedValue(void 0);

    await sendExtensionMessage(message);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(message);
  });

  it("should handle errors when browser.runtime.sendMessage fails", async () => {
    const mockError = new Error("Extension context invalidated");

    vi.mocked(browser.runtime.sendMessage).mockRejectedValue(mockError);

    await expect(sendExtensionMessage(message)).rejects.toThrow(mockError);
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(message);
  });
});
