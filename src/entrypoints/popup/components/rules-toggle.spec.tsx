import { describe, it, expect, vi, beforeEach } from "vitest";
import { RulesToggle } from "./rules-toggle";
import { useActiveTab } from "../hooks/use-active-tab";
import { useRules } from "../hooks/use-rules";
import { useScopedPermissions } from "../hooks/use-scoped-permissions";
import { render, fireEvent, screen } from "@testing-library/react";

// Mocks
vi.mock("../hooks/use-active-tab");
vi.mock("../hooks/use-rules");
vi.mock("../hooks/use-scoped-permissions");

// Mock child components to isolate unit test
vi.mock("./permission-warning", () => ({
  PermissionWarning: ({ hasRule }: { hasRule: boolean }) => (
    <div data-testid="permission-warning" data-has-rule={hasRule.toString()} />
  ),
}));

vi.mock("./card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./rule-checkbox", () => ({
  RuleCheckbox: ({ title, description, checked, onClick }: any) => (
    <button data-testid={`checkbox-${title}`} data-description={description} data-checked={checked} onClick={onClick}>
      {title}
    </button>
  ),
}));

const mockUseActiveTab = vi.mocked(useActiveTab);
const mockUseRules = vi.mocked(useRules);
const mockUseScopedPermissions = vi.mocked(useScopedPermissions);

describe("RulesToggle", () => {
  const mockUrl = new URL("https://example.com/path");
  const mockTogglePageRule = vi.fn();
  const mockToggleDomainRule = vi.fn();
  const mockRequestScopedPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseActiveTab.mockReturnValue({
      url: mockUrl,
      isSupportedUrl: true,
      rootDomain: "example.com",
      hostname: "example.com",
      isHttps: true,
    });

    mockUseRules.mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });

    mockUseScopedPermissions.mockReturnValue({
      hasScopedPermission: true,
      requestScopedPermission: mockRequestScopedPermission,
    });
  });

  const PAGE_TITLE = "Always keep this exact page awake";
  const WEBSITE_TITLE = "Always keep this entire website awake";

  it("should verify mocking setup", () => {
    // Basic test to ensure render works
    const { container } = render(<RulesToggle />);
    expect(container).toBeTruthy();
  });

  it("should return null if isSupportedUrl is false", () => {
    mockUseActiveTab.mockReturnValue({
      isSupportedUrl: false,
      url: null,
      rootDomain: "",
      hostname: "",
      isHttps: false,
    });

    const { container } = render(<RulesToggle />);
    expect(container.innerHTML).toBe("");
  });

  it("should render checkboxes with correct descriptions", () => {
    render(<RulesToggle />);

    const pageCheckbox = screen.getByTestId(`checkbox-${PAGE_TITLE}`);
    const domainCheckbox = screen.getByTestId(`checkbox-${WEBSITE_TITLE}`);

    expect(pageCheckbox).toBeTruthy();
    expect(pageCheckbox.getAttribute("data-description")).toBe("example.com/path");

    expect(domainCheckbox).toBeTruthy();
    expect(domainCheckbox.getAttribute("data-description")).toBe("example.com");
  });

  it("should reflect rule state in checkboxes", () => {
    mockUseRules.mockReturnValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" },
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });

    render(<RulesToggle />);

    const pageCheckbox = screen.getByTestId(`checkbox-${PAGE_TITLE}`);
    const domainCheckbox = screen.getByTestId(`checkbox-${WEBSITE_TITLE}`);

    expect(pageCheckbox.getAttribute("data-checked")).toBe("true");
    expect(domainCheckbox.getAttribute("data-checked")).toBe("false");
  });

  it("should call togglePageRule when page rule checkbox is clicked", () => {
    render(<RulesToggle />);
    const pageCheckbox = screen.getByTestId(`checkbox-${PAGE_TITLE}`);

    fireEvent.click(pageCheckbox);

    expect(mockTogglePageRule).toHaveBeenCalledWith(mockUrl.href);
  });

  it("should call toggleDomainRule when domain rule checkbox is clicked", () => {
    render(<RulesToggle />);
    const domainCheckbox = screen.getByTestId(`checkbox-${WEBSITE_TITLE}`);

    fireEvent.click(domainCheckbox);

    expect(mockToggleDomainRule).toHaveBeenCalledWith(mockUrl.href);
  });

  it("should request permission when enabling page rule if permission is missing", () => {
    mockUseRules.mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    mockUseScopedPermissions.mockReturnValue({
      hasScopedPermission: false, // Permission missing
      requestScopedPermission: mockRequestScopedPermission,
    });

    render(<RulesToggle />);
    const pageCheckbox = screen.getByTestId(`checkbox-${PAGE_TITLE}`);

    fireEvent.click(pageCheckbox);

    expect(mockTogglePageRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).toHaveBeenCalledWith(mockUrl.href);
  });

  it("should NOT request permission when enabling page rule if permission is present", () => {
    mockUseRules.mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    mockUseScopedPermissions.mockReturnValue({
      hasScopedPermission: true, // Permission present
      requestScopedPermission: mockRequestScopedPermission,
    });

    render(<RulesToggle />);
    const pageCheckbox = screen.getByTestId(`checkbox-${PAGE_TITLE}`);

    fireEvent.click(pageCheckbox);

    expect(mockTogglePageRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).not.toHaveBeenCalled();
  });

  it("should NOT request permission when disabling page rule (even if permission missing)", () => {
    mockUseRules.mockReturnValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" }, // Rule is ON
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    mockUseScopedPermissions.mockReturnValue({
      hasScopedPermission: false,
      requestScopedPermission: mockRequestScopedPermission,
    });

    render(<RulesToggle />);
    const pageCheckbox = screen.getByTestId(`checkbox-${PAGE_TITLE}`);

    fireEvent.click(pageCheckbox);

    expect(mockTogglePageRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).not.toHaveBeenCalled();
  });

  it("should request permission when enabling domain rule if permission is missing", () => {
    mockUseRules.mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });
    mockUseScopedPermissions.mockReturnValue({
      hasScopedPermission: false,
      requestScopedPermission: mockRequestScopedPermission,
    });

    render(<RulesToggle />);
    const domainCheckbox = screen.getByTestId(`checkbox-${WEBSITE_TITLE}`);

    fireEvent.click(domainCheckbox);

    expect(mockToggleDomainRule).toHaveBeenCalled();
    expect(mockRequestScopedPermission).toHaveBeenCalledWith(mockUrl.href);
  });

  it("should pass correct hasRule prop to PermissionWarning", () => {
    // Case 1: hasRule is false (no rules active)
    mockUseRules.mockReturnValue({
      ruleState: null,
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });

    const { unmount } = render(<RulesToggle />);
    let warning = screen.getByTestId("permission-warning");
    expect(warning.getAttribute("data-has-rule")).toBe("false");

    unmount();

    // Case 2: hasRule is true (page rule active)
    mockUseRules.mockReturnValue({
      ruleState: { hasPageRule: true, hasDomainRule: false, rootDomain: "example.com" },
      togglePageRule: mockTogglePageRule,
      toggleDomainRule: mockToggleDomainRule,
    });

    render(<RulesToggle />);
    warning = screen.getByTestId("permission-warning");
    expect(warning.getAttribute("data-has-rule")).toBe("true");
  });
});
