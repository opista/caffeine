import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import { act } from 'react';
import { RulesToggle } from './rules-toggle';
import { useActiveTab } from '../../hooks/use-active-tab';
import { useRules } from '../../hooks/use-rules';
import { useScopedPermissions } from '../../hooks/use-scoped-permissions';
import { render } from '../../test/utils';

// Mocks
vi.mock('../../hooks/use-active-tab');
vi.mock('../../hooks/use-rules');
vi.mock('../../hooks/use-scoped-permissions');

// Mock child components to isolate unit test
vi.mock('./permission-warning', () => ({
  PermissionWarning: ({ hasRule }: { hasRule: boolean }) => (
    <div data-testid="permission-warning" data-has-rule={hasRule.toString()} />
  ),
}));

vi.mock('./card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./rule-checkbox', () => ({
  RuleCheckbox: ({ title, description, checked, onClick }: any) => (
    <button
      data-testid={`checkbox-${title}`}
      data-description={description}
      data-checked={checked}
      onClick={onClick}
    >
      {title}
    </button>
  ),
}));

describe('RulesToggle', () => {
  const mockUrl = new URL('https://example.com/path');
  const mockTogglePageRule = vi.fn();
  const mockToggleDomainRule = vi.fn();
  const mockRequestScopedPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useActiveTab as Mock).mockReturnValue({
      url: mockUrl,
      isSupportedUrl: true,
      rootDomain: 'example.com',
    });

    (useRules as Mock).mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });

    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: true,
      requestScopedPermission: mockRequestScopedPermission,
    });
  });

  it('should verify mocking setup', () => {
    // Basic test to ensure render works
    const { container } = render(<RulesToggle />);
    expect(container).toBeTruthy();
  });

  it('should return null if isSupportedUrl is false', () => {
    (useActiveTab as Mock).mockReturnValue({
      isSupportedUrl: false,
      url: null,
      rootDomain: '',
    });

    const { container } = render(<RulesToggle />);
    expect(container.innerHTML).toBe('');
  });

  it('should render checkboxes with correct descriptions', () => {
    const { container } = render(<RulesToggle />);

    const pageCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this URL"]');
    const domainCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this website"]');

    expect(pageCheckbox).toBeTruthy();
    expect(pageCheckbox?.getAttribute('data-description')).toBe('example.com/path');

    expect(domainCheckbox).toBeTruthy();
    expect(domainCheckbox?.getAttribute('data-description')).toBe('example.com');
  });

  it('should reflect rule state in checkboxes', () => {
    (useRules as Mock).mockReturnValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: 'example.com' },
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });

    const { container } = render(<RulesToggle />);

    const pageCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this URL"]');
    const domainCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this website"]');

    expect(pageCheckbox?.getAttribute('data-checked')).toBe('true');
    expect(domainCheckbox?.getAttribute('data-checked')).toBe('false');
  });

  it('should call togglePageRule when page rule checkbox is clicked', () => {
    const { container } = render(<RulesToggle />);
    const pageCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this URL"]');

    act(() => {
      pageCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockTogglePageRule).toHaveBeenCalledWith(mockUrl.href);
  });

  it('should call toggleDomainRule when domain rule checkbox is clicked', () => {
    const { container } = render(<RulesToggle />);
    const domainCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this website"]');

    act(() => {
        domainCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockToggleDomainRule).toHaveBeenCalledWith(mockUrl.href);
  });

  it('should request permission when enabling page rule if permission is missing', () => {
    (useRules as Mock).mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: false, // Permission missing
      requestScopedPermission: mockRequestScopedPermission,
    });

    const { container } = render(<RulesToggle />);
    const pageCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this URL"]');

    act(() => {
      pageCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockTogglePageRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).toHaveBeenCalledWith(mockUrl.href);
  });

  it('should NOT request permission when enabling page rule if permission is present', () => {
    (useRules as Mock).mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    (useScopedPermissions as Mock).mockReturnValue({
        hasScopedPermission: true, // Permission present
        requestScopedPermission: mockRequestScopedPermission,
    });

    const { container } = render(<RulesToggle />);
    const pageCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this URL"]');

    act(() => {
      pageCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockTogglePageRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).not.toHaveBeenCalled();
  });

  it('should NOT request permission when disabling page rule (even if permission missing)', () => {
    (useRules as Mock).mockReturnValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: 'example.com' }, // Rule is ON
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    (useScopedPermissions as Mock).mockReturnValue({
        hasScopedPermission: false, // Permission missing (unlikely state if rule is ON, but possible if permissions revoked externally)
        requestScopedPermission: mockRequestScopedPermission,
    });

    const { container } = render(<RulesToggle />);
    const pageCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this URL"]');

    act(() => {
      pageCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Clicking when ON toggles it OFF. We should verify requestScopedPermission is NOT called.
    expect(mockTogglePageRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).not.toHaveBeenCalled();
  });

  it('should request permission when enabling domain rule if permission is missing', () => {
    (useRules as Mock).mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: false,
      requestScopedPermission: mockRequestScopedPermission,
    });

    const { container } = render(<RulesToggle />);
    const domainCheckbox = container.querySelector('[data-testid="checkbox-Keep awake for this website"]');

    act(() => {
        domainCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockToggleDomainRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).toHaveBeenCalledWith(mockUrl.href);
  });

  it('should pass correct hasRule prop to PermissionWarning', () => {
    // Case 1: hasRule is false (no rules active)
    (useRules as Mock).mockReturnValue({
        ruleState: null,
        togglePageRule: mockTogglePageRule,
        toggleDomainRule: mockToggleDomainRule,
    });

    const { container, unmount } = render(<RulesToggle />);
    let warning = container.querySelector('[data-testid="permission-warning"]');
    expect(warning?.getAttribute('data-has-rule')).toBe('false');

    unmount();

    // Case 2: hasRule is true (page rule active)
    (useRules as Mock).mockReturnValue({
        ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: 'example.com' },
        togglePageRule: mockTogglePageRule,
        toggleDomainRule: mockToggleDomainRule,
    });

    const { container: container2 } = render(<RulesToggle />);
    warning = container2.querySelector('[data-testid="permission-warning"]');
    expect(warning?.getAttribute('data-has-rule')).toBe('true');
  });
});
