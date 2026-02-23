import { useScopedPermissions } from "../../hooks/use-scoped-permissions";
import { IconAlertCircle, IconArrowRight } from "@tabler/icons-react";
import { Card } from "./card";

type PermissionWarningProps = {
  hasRule?: boolean;
  url: URL | null;
};

export const PermissionWarning = ({ hasRule, url }: PermissionWarningProps) => {
  const { hasScopedPermission, requestScopedPermission } = useScopedPermissions(url);

  if (hasScopedPermission || !hasRule) return null;

  return (
    <Card className="bg-red-50 border border-red-100 p-4 flex-row gap-3 items-start">
      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
        <IconAlertCircle size={18} className="text-red-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-red-900 leading-none mb-1">Permission required</h3>
        <p className="text-[11px] text-red-700 leading-tight">
          Please enable site access to allow this rule to work.
        </p>
        <button
          onClick={() => url && requestScopedPermission(url.href)}
          className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 hover:underline cursor-pointer"
        >
          Grant Permission <IconArrowRight size={14} />
        </button>
      </div>
    </Card>
  );
};
