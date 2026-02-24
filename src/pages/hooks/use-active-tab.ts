import { useState, useEffect, useMemo } from "react";
import browser from "webextension-polyfill";
import { getRootDomain } from "../../utils/get-root-domain";

export const useActiveTab = () => {
  const [activeUrl, setActiveUrl] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      setActiveUrl(tabs[0]?.url ?? null);
    });
  }, []);

  return useMemo(() => {
    // Initial state: tab query hasn't completed
    if (activeUrl === undefined) {
      return { hostname: "", url: null, isSupportedUrl: false, isHttps: false, rootDomain: "" };
    }

    // No active tab, or tab has no URL, or non-http protocol
    if (activeUrl === null || !activeUrl.startsWith("http")) {
      return {
        hostname: "Unsupported Page",
        url: null,
        isSupportedUrl: false,
        isHttps: false,
        rootDomain: "",
      };
    }

    try {
      const urlObj = new URL(activeUrl);
      const isHttps = urlObj.protocol === "https:";
      const isSupportedUrl = isHttps && !!urlObj.hostname;
      const rootDomain = getRootDomain(activeUrl);

      return {
        hostname: urlObj.hostname || "Unknown Page",
        url: isSupportedUrl ? urlObj : null,
        isSupportedUrl,
        isHttps,
        rootDomain,
      };
    } catch {
      return {
        hostname: "Unknown Page",
        url: null,
        isSupportedUrl: false,
        isHttps: false,
        rootDomain: "",
      };
    }
  }, [activeUrl]);
};
