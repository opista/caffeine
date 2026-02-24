import { browser } from "wxt/browser";

export const getOperatingSystem = async () => {
  try {
    const platform = await browser.runtime.getPlatformInfo();
    return platform.os;
  } catch {
    return null;
  }
};
