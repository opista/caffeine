import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import { getRootDomain } from "../utils/get-root-domain";
import { sendExtensionMessage } from "../pages/utils/send-extension-message";
import { createDomainOriginPermissionString } from "../background/create-domain-origin-permission-string";
import { MessageType } from "../types";

const fetchScopedPermissions = async (url: URL | null) => {
  if (!url) return false;
  return sendExtensionMessage({ type: MessageType.GET_PERMISSION_FOR_TAB })
    .catch(() => null)
    .then((hasPermission) => hasPermission ?? false);
};

const requestScopedPermission = async (targetUrl: string) => {
  const rootDomain = getRootDomain(targetUrl);
  if (!rootDomain) return;
  browser.permissions.request({ origins: [createDomainOriginPermissionString(rootDomain)] });
  window.close();
};

export const useScopedPermissions = (url: URL | null) => {
  const [hasScopedPermission, setHasScopedPermission] = useState(false);

  useEffect(() => {
    fetchScopedPermissions(url).then(setHasScopedPermission);
  }, [url]);

  return { hasScopedPermission, requestScopedPermission };
};
