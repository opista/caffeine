import { describe, it, expect, vi, Mock, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PermissionWarning } from "./permission-warning";
import { useScopedPermissions } from "../hooks/use-scoped-permissions";

vi.mock("../hooks/use-scoped-permissions");

describe("PermissionWarning", () => {
  const mockRequestScopedPermission = vi.fn();
  const testUrl = new URL("https://example.com");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if url is null", () => {
    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: false,
      requestScopedPermission: mockRequestScopedPermission,
    });
    const { container } = render(<PermissionWarning url={null} hasRule={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null if it lacks a rule", () => {
    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: false,
      requestScopedPermission: mockRequestScopedPermission,
    });
    const { container } = render(<PermissionWarning url={testUrl} hasRule={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null if the user already has scopes permissions", () => {
    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: true,
      requestScopedPermission: mockRequestScopedPermission,
    });
    const { container } = render(<PermissionWarning url={testUrl} hasRule={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render error alert and call request permission on button click", () => {
    (useScopedPermissions as Mock).mockReturnValue({
      hasScopedPermission: false,
      requestScopedPermission: mockRequestScopedPermission,
    });
    render(<PermissionWarning url={testUrl} hasRule={true} />);

    expect(screen.getByText("Access needed")).toBeDefined();
    expect(screen.getByText(/Please allow the extension to read this site/)).toBeDefined();

    const button = screen.getByRole("button", { name: /Grant Permission/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(mockRequestScopedPermission).toHaveBeenCalledWith(testUrl.href);
  });
});
