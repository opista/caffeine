import { browser } from "wxt/browser";

export const injectContentScript = (tabId: number) =>
  browser.scripting.executeScript({
    target: { tabId },
    files: ["/contents.js"],
  });
