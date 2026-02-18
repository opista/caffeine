import browser from "webextension-polyfill";
import { LockStatus } from "../types";

type BadgeConfig = {
  color?: string;
  text: string;
}

const badgeMap: Record<LockStatus, BadgeConfig> = {
  active: {
    text: "ON",
    color: "#2ecc71"
  },
  error: {
    text: "ERR",
    color: "#e74c3c"
  },
  inactive: {
    text: "",
  }
}

const defaultState = badgeMap.inactive;

export const updateBadge = (tabId: number, status: LockStatus) => {
    const { text, color } = badgeMap[status] || defaultState;

    browser.action.setBadgeText({ text, tabId }).catch(console.error);
    if (color) browser.action.setBadgeBackgroundColor({ color, tabId }).catch(console.error);
}
