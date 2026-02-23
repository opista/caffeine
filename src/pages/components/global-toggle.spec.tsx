import { describe, it, expect, vi, Mock } from "vitest";
import { act } from "react";
import { GlobalToggle } from "./global-toggle";
import { useGlobalPermissions } from "../../hooks/use-global-permissions";
import { render } from "../../test/utils";

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

    const { container } = render(<GlobalToggle />);

    expect(container.textContent).toContain("Advanced permissions are required");
    expect(container.textContent).toContain("Enable Access to All Websites");
  });

  it("should call toggleGlobalPermission when the button is clicked", () => {
    const toggleGlobalPermissionMock = vi.fn();
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: toggleGlobalPermissionMock,
    });

    const { container } = render(<GlobalToggle />);

    const button = container.querySelector("button");
    expect(button).toBeTruthy();

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(toggleGlobalPermissionMock).toHaveBeenCalled();
  });
});
