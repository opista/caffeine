import "./Popup.css";
import { cn } from './utils/cn';
import { usePlatform } from '../hooks/use-platform';
import { useActiveTab } from '../hooks/use-active-tab';
import { useWakeLock } from '../hooks/use-wake-lock';

export default function Popup() {
  const { isAndroid } = usePlatform();
  const { hostname, isSupportedUrl } = useActiveTab();
  const { status, errorMsg, toggleSession } = useWakeLock(isAndroid);

  return (
    <div className={cn(
      "bg-[#202124] text-white font-sans flex flex-col p-4 overflow-hidden",
      isAndroid
        ? "w-full h-full min-h-[350px] max-w-[500px] mx-auto rounded-xl shadow-2xl"
        : "w-[300px] h-[200px]"
    )}>
      <header className="flex items-center gap-2.5 mb-5">
        <img src="/icon-with-shadow.svg" width="24" height="24" alt="Logo" />
        <h1 className="text-lg font-semibold m-0">Caffeine</h1>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div className={cn("text-xs text-[#9aa0a6] truncate", isAndroid ? "max-w-[250px]" : "max-w-[150px]")}>{hostname}</div>

        <button
          className={cn("bg-transparent border-2 border-[#5f6368] text-[#bdc1c6] px-6 py-3 rounded-full text-base font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 w-full justify-center hover:border-[#8ab4f8] hover:text-[#8ab4f8]", {
            "bg-[#2ecc71] border-[#2ecc71] text-white shadow-[0_2px_8px_rgba(46,204,113,0.4)] hover:bg-[#27ae60] hover:border-[#27ae60]": status === "active" && isSupportedUrl,
            "bg-[#f1c40f] border-[#f1c40f] text-black hover:bg-[#f39c12] hover:border-[#f39c12]": status === "pending",
            "opacity-50 cursor-not-allowed hover:border-[#5f6368] hover:text-[#bdc1c6]": !isSupportedUrl
          })}
          onClick={toggleSession}
          disabled={status === "pending" || !isSupportedUrl}
        >
          {status === "active" ? "Active ☕" : status === "pending" ? "Activating..." : "Keep Awake"}
        </button>

        <div className="text-[13px] text-[#9aa0a6] flex items-center gap-1.5">
          <div
            className={cn("w-2 h-2 rounded-full bg-[#5f6368]", {
              "bg-[#2ecc71] shadow-[0_0_8px_rgba(46,204,113,0.6)]": status === "active",
              "bg-[#f1c40f]": status === "pending",
              "bg-[#e74c3c]": status === "error"
            })}
          ></div>
          <span>
            {status === "active"
              ? "Screen Wake Lock On"
              : status === "pending"
                ? "Requesting Lock..."
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

