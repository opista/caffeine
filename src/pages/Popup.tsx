import { useEffect, useState } from 'react';
import browser from "webextension-polyfill";
import "./Popup.css";
import { LockStatus } from '../types';
import { cn } from './utils/cn';

export default function Popup() {
  const [status, setStatus] = useState<LockStatus>("inactive");
  const [hostname, setHostname] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.url) {
        try {
          const url = new URL(tabs[0].url);
          setHostname(url.hostname);
        } catch {
          setHostname("Unknown Page");
        }
      }
    });

    browser.runtime.sendMessage({ type: "GET_STATUS" }).then((response) => {
      if (response && response.status) {
        setStatus(response.status);
      }
    });
  }, []);

  const toggleSession = async () => {
    const response = await browser.runtime.sendMessage({ type: "TOGGLE_SESSION" });
    if (response) {
      if (response.status === "error") {
        setStatus("error");
        setErrorMsg(response.error);
      } else if (response.status === "pending") {
        setTimeout(async () => {
          const res = await browser.runtime.sendMessage({ type: "GET_STATUS" });
          if (res?.status) setStatus(res.status);
        }, 300);
      }
    }
  };

  return (
    <div className="w-[300px] h-[200px] bg-[#202124] text-white font-sans flex flex-col p-4">
      <header className="flex items-center gap-2.5 mb-5">
        <img src="/icon-with-shadow.svg" width="24" height="24" alt="Logo" />
        <h1 className="text-lg font-semibold m-0">Caffeine</h1>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div className="text-xs text-[#9aa0a6] truncate max-w-[150px]">{hostname || "Current Tab"}</div>

        <button
          className={cn("bg-transparent border-2 border-[#5f6368] text-[#bdc1c6] px-6 py-3 rounded-full text-base font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 w-full justify-center hover:border-[#8ab4f8] hover:text-[#8ab4f8]", {
            "bg-[#2ecc71] border-[#2ecc71] text-white shadow-[0_2px_8px_rgba(46,204,113,0.4)] hover:bg-[#27ae60] hover:border-[#27ae60]": status === "active"
          })}
          onClick={toggleSession}
        >
          {status === "active" ? "Active ☕" : "Keep Awake"}
        </button>

        <div className="text-[13px] text-[#9aa0a6] flex items-center gap-1.5">
          <div
            className={cn("w-2 h-2 rounded-full bg-[#5f6368]", {
              "bg-[#2ecc71] shadow-[0_0_8px_rgba(46,204,113,0.6)]": status === "active",
              "bg-[#e74c3c]": status === "error"
            })}
          ></div>
          <span>
            {status === "active"
              ? "Screen Wake Lock On"
              : status === "error"
                ? "Error"
                : "Inactive"}
          </span>
        </div>

        {status === "error" && errorMsg && (
          <div className="text-[#e74c3c] text-[11px] text-center mt-1">{errorMsg}</div>
        )}
      </div>
    </div>
  );
}

