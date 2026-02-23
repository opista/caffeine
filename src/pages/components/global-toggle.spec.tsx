import { describe, it, expect, vi, Mock } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { GlobalToggle } from './global-toggle';
import { useGlobalPermissions } from '../../hooks/use-global-permissions';

vi.mock('../../hooks/use-global-permissions');

function renderComponent() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<GlobalToggle />);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}

describe('GlobalToggle', () => {
  it('should not render anything when global permission is granted', () => {
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: true,
      toggleGlobalPermission: vi.fn(),
    });

    const { container, unmount } = renderComponent();

    expect(container.textContent).toBe('');

    unmount();
  });

  it('should render the permission card when global permission is missing', () => {
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: vi.fn(),
    });

    const { container, unmount } = renderComponent();

    expect(container.textContent).toContain('Advanced permissions are required');
    expect(container.textContent).toContain('Enable Access to All Websites');

    unmount();
  });

  it('should call toggleGlobalPermission when the button is clicked', () => {
    const toggleGlobalPermissionMock = vi.fn();
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: toggleGlobalPermissionMock,
    });

    const { container, unmount } = renderComponent();

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(toggleGlobalPermissionMock).toHaveBeenCalled();

    unmount();
  });
});
