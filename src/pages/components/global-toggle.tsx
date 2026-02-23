import { IconLockAccess, IconShieldCheck } from "@tabler/icons-react";
import { useGlobalPermissions } from "../../hooks/use-global-permissions";
import { Card } from "./card";

export const GlobalToggle = () => {
  const { hasGlobalPermission, toggleGlobalPermission } = useGlobalPermissions();

  if (hasGlobalPermission) return null;

  return (
    <Card className="bg-slate-900 p-5">
      <div className="flex items-start gap-3 mb-4">
        <IconShieldCheck size={20} className="text-brand shrink-0" />
        <p className="text-[11px] text-slate-400 leading-normal font-medium">
          Advanced permissions are required for the extension to function on every site automatically.
        </p>
      </div>
      <button
        onClick={toggleGlobalPermission}
        className="cursor-pointer w-full bg-brand hover:bg-brand/90 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-brand/30 transition-all flex items-center justify-center gap-2"
      >
        <IconLockAccess size={16} />
        Enable Access to All Websites
      </button>
    </Card>
  );
};
