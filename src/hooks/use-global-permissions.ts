import { useState, useEffect } from 'react';
import browser from "webextension-polyfill";

const GLOBAL_ORIGIN = "*://*/*";

const fetchGlobalPermissions = async () =>  browser.permissions.contains({ origins: [GLOBAL_ORIGIN] }).catch(() => false);

const requestPermission = (origin: string) => {
  browser.permissions.request({ origins: [origin] });
  window.close();
}

const removePermission = (origin: string) => browser.permissions.remove({ origins: [origin] });

export const useGlobalPermissions = () => {
  const [hasGlobalPermission, setHasGlobalPermission] = useState(false);

  useEffect(() => {
    fetchGlobalPermissions().then(setHasGlobalPermission);
  }, []);

  const toggleGlobalPermission = async () => {
    if (hasGlobalPermission) {
      await removePermission(GLOBAL_ORIGIN);
      setHasGlobalPermission(false);
    } else {
      requestPermission(GLOBAL_ORIGIN);
    }
  };

  return { hasGlobalPermission, toggleGlobalPermission };
};
