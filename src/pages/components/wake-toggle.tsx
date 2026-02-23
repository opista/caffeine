import browser from "webextension-polyfill";
import { cn } from "../utils/cn";
import { useWakeLock } from "../../hooks/use-wake-lock";
import { useActiveTab } from "../../hooks/use-active-tab";
import { usePlatform } from "../../hooks/use-platform";
import { IconAlertCircle, IconArrowRight, IconEyeClosed, IconBoltFilled } from '@tabler/icons-react';
import { Card } from './card';

export const WakeToggle = () => {
  const { isSupportedUrl } = useActiveTab();
  const { isAndroid } = usePlatform();
  const { status, errorMsg, toggleSession } = useWakeLock(isAndroid);

  const isActive = status === "active" && isSupportedUrl;
  const isPending = status === "pending";
  const isError = status === "error";

  return (
    <div className="flex flex-col gap-4">
      <Card
        as="label"
        htmlFor="main-toggle"
        className={cn(
          "p-8 items-center gap-4 text-center border transition-all duration-300 relative select-none",
          {
            "shadow-brand/10 border-brand/20 cursor-pointer": isActive,
            "shadow-slate-200/50 border-slate-100 cursor-pointer": !isActive && !isPending && isSupportedUrl,
            "shadow-amber-200/50 border-amber-200 cursor-not-allowed": isPending,
            "opacity-60 cursor-not-allowed grayscale": !isSupportedUrl,
          }
        )}
      >
        <span className="sr-only">
          {isActive ? "Deactivate wake lock" : "Activate wake lock"}
        </span>
        <div className="relative w-28 h-14">
          <input
            checked={isActive}
            onChange={toggleSession}
            disabled={isPending || !isSupportedUrl}
            className="peer sr-only"
            id="main-toggle"
            type="checkbox"
            aria-checked={isActive}
            role="switch"
          />
          <div
            className={cn(
              "block w-full h-full rounded-full transition-colors duration-300 peer-checked:bg-brand",
              {
                "bg-slate-200": !isActive,
                "bg-brand": isActive,
              }
            )}
          ></div>
          <div className="absolute top-1 left-1 w-12 h-12 bg-white rounded-full shadow-lg transition-transform duration-300 pointer-events-none flex items-center justify-center peer-checked:translate-x-14">
            {isActive ? (
              <IconBoltFilled size={24} stroke={2.5} className="text-brand" />
            ) : (
              <IconEyeClosed size={24} stroke={2.5} className={cn("transition-colors duration-300", { "text-slate-400": !isPending, "text-amber-500 animate-pulse": isPending })} />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold transition-colors">
            {isActive ? "Wake Lock is Active" : isPending ? "Activating..." : "Wake Lock is Inactive"}
          </h2>
          <p className="text-sm text-slate-500 font-medium transition-colors">
            {isActive ? "Preventing sleep automatically" : "Tap to keep screen awake"}
          </p>
        </div>
      </Card>

      {isError && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <IconAlertCircle size={18} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900 leading-none mb-1">System prevented Wake Lock</h3>
            <p className="text-[11px] text-red-700 leading-tight">
              {errorMsg || "Check your OS battery settings or power saving mode."}
            </p>
            <button
              onClick={() => browser.tabs.create({ url: "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API" })}
              className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
            >
              Fix Issue <IconArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};