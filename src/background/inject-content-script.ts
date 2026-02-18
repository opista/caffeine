import browser from "webextension-polyfill";

export const injectContentScript = (tabId: number) => browser.scripting.executeScript({
    target: { tabId },
    files: ["src/content/index.js"],
})
