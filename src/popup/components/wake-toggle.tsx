import { cn } from "../utils/cn";
import { ErrorCode } from "../../types";
import { useWakeLock } from "../hooks/use-wake-lock";
import { useActiveTab } from "../hooks/use-active-tab";
import { usePlatform } from "../hooks/use-platform";
import { IconEyeClosed, IconEyeFilled } from "@tabler/icons-react";
import { Card } from "./card";
import { WakeError } from "./wake-error";

const textMap = {
  active: {
    title: "Screen staying awake",
    description: "This tab will not go to sleep.",
  },
  inactive: {
    title: "Screen can sleep",
    description: "Tap to keep the screen on.",
  },
  pending: {
    title: "Activating...",
    description: "Just a moment...",
  },
  error: {
    title: "Couldn't keep screen on",
    description: "Tap for more details.",
  },
  unsupported: {
    title: "Caffeine unavailable",
    description: "This page is not supported.",
  },
};

export const WakeToggle = () => {
  const { isSupportedUrl } = useActiveTab();
  const { isAndroid } = usePlatform();
  const { status, errorMsg, toggleSession } = useWakeLock(isAndroid);

  const isActive = status === "active" && isSupportedUrl;
  const isPending = status === "pending";
  const isError = status === "error";

  const text = !isSupportedUrl ? textMap.unsupported : textMap[status];

  return (
    <div className="flex flex-col gap-4">
      <Card
        as="label"
        htmlFor="main-toggle"
        className={cn(
          "p-8 items-center gap-4 text-center transition-all duration-300 relative select-none outline-0 group",
          {
            "shadow-brand/10 cursor-pointer animate-glow outline-6 -outline-offset-6 outline-brand": isActive,
            "shadow-slate-200/50 border border-slate-100 cursor-pointer": !isActive && !isPending && isSupportedUrl,
            "shadow-amber-200/50 cursor-not-allowed outline-6 -outline-offset-6 outline-amber-200": isPending,
            "opacity-75 cursor-not-allowed border border-gray-100": !isSupportedUrl,
          },
        )}
      >
        <span className="sr-only">
          {!isSupportedUrl ? "Wake lock unavailable" : isActive ? "Deactivate wake lock" : "Activate wake lock"}
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
              "block w-full h-full rounded-full transition-colors duration-300 bg-slate-200 group-hover:bg-slate-300 peer-checked:bg-brand",
              { "group-hover:bg-slate-200": !isSupportedUrl },
            )}
          ></div>
          <div className="absolute top-1 left-1 w-12 h-12 bg-white rounded-full shadow-lg transition-transform duration-300 pointer-events-none flex items-center justify-center peer-checked:translate-x-14">
            {isActive ? (
              <IconEyeFilled size="1.5rem" stroke={2.5} className="text-brand" />
            ) : (
              <IconEyeClosed
                size="1.5rem"
                stroke={2.5}
                className={cn("transition-colors duration-300", {
                  "text-slate-400": !isPending,
                  "text-amber-500 animate-pulse": isPending,
                })}
              />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold transition-colors">{text.title}</h2>
          <p className="text-base text-slate-500 font-medium transition-colors">{text.description}</p>
        </div>
      </Card>

      {isError ? (
        <WakeError errorMsg={errorMsg} />
      ) : !isSupportedUrl ? (
        <WakeError errorMsg={ErrorCode.NOT_SECURE} />
      ) : null}
    </div>
  );
};
