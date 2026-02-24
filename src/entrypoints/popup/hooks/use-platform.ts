import { useState, useEffect } from "react";
import { browser } from "wxt/browser";

export const usePlatform = () => {
  const [platform, setPlatform] = useState<`${Browser.runtime.PlatformOs}` | null>(null);

  useEffect(() => {
    browser.runtime.getPlatformInfo().then((info) => {
      setPlatform(info.os);
    });
  }, []);

  return { platform, isAndroid: platform === "android" };
};
