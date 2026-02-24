import { useScopedPermissions } from "../hooks/use-scoped-permissions";
import { ErrorAlert } from "./error-alert";

type PermissionWarningProps = {
  hasRule?: boolean;
  url: URL | null;
};

export const PermissionWarning = ({ hasRule, url }: PermissionWarningProps) => {
  const { hasScopedPermission, requestScopedPermission } = useScopedPermissions(url);

  if (!url || hasScopedPermission || !hasRule) return null;

  return (
    <ErrorAlert
      title="Access needed"
      description="Please allow the extension to read this site so it knows when to keep the screen on"
      buttonText="Grant Permission"
      onButtonClick={() => url && requestScopedPermission(url.href)}
    />
  );
};
