import { browser } from "wxt/browser";
import { LockStatus } from "../../types";
import { getOperatingSystem } from "./get-operating-system";

type BadgeConfig = {
  color?: string;
  text: Text;
};

type Text = {
  android: string;
  desktop: string;
};

const badgeMap: Record<LockStatus, BadgeConfig> = {
  active: {
    text: {
      android: "ACTIVE",
      desktop: "ON",
    },
    color: "#2ecc71",
  },
  pending: {
    text: {
      android: "PENDING",
      desktop: "",
    },
    color: "#f39c12",
  },
  error: {
    text: {
      android: "ERROR",
      desktop: "ERR",
    },
    color: "#e74c3c",
  },
  inactive: {
    text: {
      android: "OFF",
      desktop: "",
    },
  },
};

const defaultState = badgeMap.inactive;

export const updateBadge = async (tabId: number, status: LockStatus) => {
  if (!tabId || tabId <= 0) return;

  const os = await getOperatingSystem();
  const isAndroid = os === "android";

  const config = badgeMap[status] || defaultState;
  const { color } = config;
  const text = isAndroid ? config.text.android : config.text.desktop;

  browser.action.setBadgeText({ text, tabId }).catch(console.error);

  if (color) browser.action.setBadgeBackgroundColor({ color, tabId }).catch(console.error);
};
