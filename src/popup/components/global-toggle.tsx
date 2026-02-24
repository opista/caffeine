import { IconLockAccess, IconShieldCheck } from "@tabler/icons-react";
import { useGlobalPermissions } from "../hooks/use-global-permissions";
import { Card } from "./card";

export const GlobalToggle = () => {
  const { hasGlobalPermission, toggleGlobalPermission } = useGlobalPermissions();

  if (hasGlobalPermission) return null;

  return (
    <footer className="mt-auto shrink-0">
      <Card className="bg-slate-900 p-5">
        <div className="flex items-start gap-3 mb-4">
          <IconShieldCheck size="1.25rem" className="text-brand shrink-0" />
          <p className="text-xs text-slate-400 leading-normal font-medium">
            Tired of permission popups? Grant access to all websites once, and your 'Always Keep Awake' rules will work
            instantly without asking every time.
          </p>
        </div>
        <button
          onClick={toggleGlobalPermission}
          className="cursor-pointer w-full bg-brand hover:bg-brand/90 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-brand/30 transition-all flex items-center justify-center gap-2"
        >
          <IconLockAccess size="1rem" />
          Allow on all websites
        </button>
      </Card>
    </footer>
  );
};
