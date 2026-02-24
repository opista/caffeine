import { useState, useEffect, useCallback } from "react";
import browser from "webextension-polyfill";
import { LockStatus, MessageType } from "../types";
import { sendExtensionMessage } from "../pages/utils/send-extension-message";

export const useWakeLock = (isAndroid: boolean) => {
  const [status, setStatus] = useState<LockStatus>("inactive");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    sendExtensionMessage({ type: MessageType.GET_STATUS }).then((response) => {
      if (response?.status) {
        setStatus(response.status);
        if (response.error) setErrorMsg(response.error);
      }
    });

    const messageHandler = (message: any) => {
      if (message.type === MessageType.STATUS_UPDATE && message.status) {
        setStatus(message.status);
        if (message.error) setErrorMsg(message.error);
      }
    };
    browser.runtime.onMessage.addListener(messageHandler);

    return () => browser.runtime.onMessage.removeListener(messageHandler);
  }, []);

  const toggleSession = useCallback(async () => {
      const response = await sendExtensionMessage({ type: MessageType.TOGGLE_SESSION });

    if (response) {
      if (response.status === "error") {
        setStatus("error");
        setErrorMsg(response.error ?? null);
      } else if (response.status === "pending") {
        setStatus((prev) => (prev === "active" || prev === "error" ? prev : "pending"));
        if (isAndroid) {
          setTimeout(() => window.close(), 300);
        }
      } else if (response.status === "inactive") {
        setStatus("inactive");
        setErrorMsg(null);
      }
    }
  }, [isAndroid]);

  return { status, errorMsg, toggleSession };
};
