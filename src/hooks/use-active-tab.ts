import { useState, useEffect } from 'react';
import browser from "webextension-polyfill";

export const useActiveTab = () => {
  const [hostname, setHostname] = useState<string>("");
  const [isSupportedUrl, setIsSupportedUrl] = useState<boolean>(false);

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.url && activeTab.url.startsWith('http')) {
        try {
          const url = new URL(activeTab.url);
          setHostname(url.hostname);
          setIsSupportedUrl(url.protocol === 'https:' && !!url.hostname);
        } catch {
          setHostname("Unknown Page");
          setIsSupportedUrl(false);
        }
      } else {
        setHostname("Unsupported Page");
        setIsSupportedUrl(false);
      }
    });
  }, []);

  return { hostname, isSupportedUrl };
}
