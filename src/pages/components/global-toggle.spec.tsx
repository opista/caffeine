import { describe, it, expect, vi, Mock, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { GlobalToggle } from './global-toggle';
import { useGlobalPermissions } from '../../hooks/use-global-permissions';

vi.mock('../../hooks/use-global-permissions');

let container: HTMLDivElement | null = null;
let root: any = null;

function renderComponent() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(<GlobalToggle />);
  });

  return { container };
}

describe('GlobalToggle', () => {
  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  it('should not render anything when global permission is granted', () => {
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: true,
      toggleGlobalPermission: vi.fn(),
    });

    const { container } = renderComponent();

    expect(container.textContent).toBe('');
  });

  it('should render the permission card when global permission is missing', () => {
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: vi.fn(),
    });

    const { container } = renderComponent();

    expect(container.textContent).toContain('Advanced permissions are required');
    expect(container.textContent).toContain('Enable Access to All Websites');
  });

  it('should call toggleGlobalPermission when the button is clicked', () => {
    const toggleGlobalPermissionMock = vi.fn();
    (useGlobalPermissions as Mock).mockReturnValue({
      hasGlobalPermission: false,
      toggleGlobalPermission: toggleGlobalPermissionMock,
    });

    const { container } = renderComponent();

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(toggleGlobalPermissionMock).toHaveBeenCalled();
  });
});
