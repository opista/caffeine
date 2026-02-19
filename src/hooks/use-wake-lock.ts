import { useState, useEffect, useCallback } from 'react';
import browser from "webextension-polyfill";
import { LockStatus } from '../types';

export const useWakeLock = (isAndroid: boolean) => {
  const [status, setStatus] = useState<LockStatus>("inactive");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    browser.runtime.sendMessage({ type: "GET_STATUS" }).then((response) => {
      if (response?.status) {
        setStatus(response.status);
        if (response.error) setErrorMsg(response.error);
      }
    });

    const messageHandler = (message: any) => {
      if (message.type === "STATUS_UPDATE" && message.status) {
        setStatus(message.status);
        if (message.error) setErrorMsg(message.error);
      }
    };
    browser.runtime.onMessage.addListener(messageHandler);

    return () => browser.runtime.onMessage.removeListener(messageHandler);
  }, []);

  const toggleSession = useCallback(async () => {
      const response = await browser.runtime.sendMessage({ type: "TOGGLE_SESSION" });

      if (response) {
        if (response.status === "error") {
          setStatus("error");
          setErrorMsg(response.error);
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
}
