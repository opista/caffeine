import { RulesToggle } from "./components/rules-toggle";
import { WakeToggle } from "./components/wake-toggle";
import { IconCoffee } from "@tabler/icons-react";
import { GlobalToggle } from "./components/global-toggle";

export default function Popup() {
  return (
    <div className="w-[360px] flex flex-col gap-6 p-6">
      <header className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
            <IconCoffee size={24} color="white" stroke={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Caffeine</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Keep your screen awake</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4">
        <WakeToggle />
        <RulesToggle />
      </main>

      <footer className="mt-auto shrink-0">
        <GlobalToggle />
      </footer>
    </div>
  );
}
