import { useState, useEffect } from 'react';
import browser from "webextension-polyfill";

export const usePlatform = () => {
  const [platform, setPlatform] = useState<browser.Runtime.PlatformOs | null>(null);

  useEffect(() => {
    browser.runtime.getPlatformInfo().then((info) => {
      setPlatform(info.os);
    });
  }, []);

  return { platform, isAndroid: platform === 'android' };
}
