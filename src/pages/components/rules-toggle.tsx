import { useActiveTab } from '../../hooks/use-active-tab';
import { useRules } from '../../hooks/use-rules';
import { useScopedPermissions } from '../../hooks/use-scoped-permissions';
import { PermissionWarning } from './permission-warning';
import { Card } from './card';
import { RuleCheckbox } from './rule-checkbox';

const formatPageUrl = (url: URL | null) => {
  if (!url) return
  return url.hostname + url.pathname
}

export const RulesToggle = () => {
  const { url, isSupportedUrl, rootDomain } = useActiveTab();
  const { ruleState, togglePageRule, toggleDomainRule } = useRules(url);
  const { hasScopedPermission, requestScopedPermission } = useScopedPermissions(url);

  if (!isSupportedUrl) return null;

  return (
    <div className="flex flex-col gap-4">
      <PermissionWarning hasRule={!!ruleState} url={url} />

      <Card>
        <RuleCheckbox
          title="Keep awake for this URL"
          description={formatPageUrl(url) || "This page"}
          checked={ruleState?.hasPageRule ?? false}
          className="border-b border-slate-50"
          onClick={() => {
            if (url) {
              togglePageRule(url.href);
              if (!ruleState?.hasPageRule && !hasScopedPermission) {
                requestScopedPermission(url.href);
              }
            }
          }}
        />

        <RuleCheckbox
          title="Keep awake for website"
          description={rootDomain || "This domain"}
          checked={ruleState?.hasDomainRule ?? false}
          onClick={() => {
            if (url) {
              toggleDomainRule(url.href);
              if (!ruleState?.hasDomainRule && !hasScopedPermission) {
                requestScopedPermission(url.href);
              }
            }
          }}
        />
      </Card>
    </div >
  );
};