import { ExtensionMessage, MessageResponses } from "../../types";
import browser from "webextension-polyfill";

export const sendExtensionMessage = async <T extends ExtensionMessage>(
  message: T
): Promise<MessageResponses[T["type"]]> => browser.runtime.sendMessage(message);