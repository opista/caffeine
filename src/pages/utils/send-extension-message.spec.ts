import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendExtensionMessage } from "./send-extension-message";
import browser from "webextension-polyfill";
import { ExtensionMessage, MessageType } from "../../types";

describe("sendExtensionMessage", () => {
  const message: ExtensionMessage = { type: MessageType.GET_STATUS };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a message using browser.runtime.sendMessage and return the response", async () => {
    const mockResponse = { status: "active" };

    // Mock the implementation of sendMessage
    vi.mocked(browser.runtime.sendMessage).mockResolvedValue(mockResponse);

    const response = await sendExtensionMessage(message);

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(message);
    expect(response).toEqual(mockResponse);
  });

  it("should handle errors when browser.runtime.sendMessage fails", async () => {
    const mockError = new Error("Extension context invalidated");

    vi.mocked(browser.runtime.sendMessage).mockRejectedValue(mockError);

    await expect(sendExtensionMessage(message)).rejects.toThrow(mockError);
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(message);
  });
});
