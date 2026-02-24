import { useEffect } from "react";
import { RulesToggle } from "./components/rules-toggle";
import { WakeToggle } from "./components/wake-toggle";
import { IconCoffee } from "@tabler/icons-react";
import { GlobalToggle } from "./components/global-toggle";
import { usePlatform } from "./hooks/use-platform";
import { cn } from "./utils/cn";

export default function Popup() {
  const { isAndroid } = usePlatform();

  useEffect(() => {
    if (isAndroid) document.documentElement.classList.add("is-android");
  }, [isAndroid]);

  return (
    <div className={cn("flex flex-col gap-4 p-4 mx-auto", isAndroid ? "w-full" : "w-[360px]")}>
      <header className="flex justify-between items-center shrink-0">
        <div className="flex gap-2.5">
          <div className="size-12 shrink-0 aspect-square bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
            <IconCoffee size="1.5rem" color="white" stroke={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Caffeine</h1>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Keep your screen awake</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4">
        <WakeToggle />
        <RulesToggle />
      </main>

      <GlobalToggle />
    </div>
  );
}
