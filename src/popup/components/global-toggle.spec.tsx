import { describe, it, expect, vi, Mock } from "vitest";
import { GlobalToggle } from "./global-toggle";
import { useGlobalPermissions } from "../hooks/use-global-permissions";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../hooks/use-global-permissions");

describe("GlobalToggle", () => {
  it("should not render anything when global permission is granted", () => {
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: true,
      toggleGlobalPermission: vi.fn(),
    });

    const { container } = render(<GlobalToggle />);

    expect(container.textContent).toBe("");
  });

  it("should render the permission card when global permission is missing", () => {
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: vi.fn(),
    });

    render(<GlobalToggle />);

    expect(screen.getByText(/Advanced permissions are required/i)).toBeTruthy();
    expect(screen.getByText(/Enable Access to All Websites/i)).toBeTruthy();
  });

  it("should call toggleGlobalPermission when the button is clicked", () => {
    const toggleGlobalPermissionMock = vi.fn();
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: toggleGlobalPermissionMock,
    });

    render(<GlobalToggle />);

    const button = screen.getByRole("button", { name: /Enable Access to All Websites/i });
    fireEvent.click(button);

    expect(toggleGlobalPermissionMock).toHaveBeenCalled();
  });
});
