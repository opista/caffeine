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
      title="Permission required"
      description="Please enable site access to allow this rule to work."
      buttonText="Grant Permission"
      onButtonClick={() => url && requestScopedPermission(url.href)}
    />
  );
};
