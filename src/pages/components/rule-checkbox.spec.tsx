import { describe, it, expect, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { RuleCheckbox } from './rule-checkbox';

function renderComponent(props: any) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<RuleCheckbox {...props} />);
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

describe('RuleCheckbox', () => {
  it('renders correctly with given props', () => {
    const { container, unmount } = renderComponent({
      title: 'Keep awake for this URL',
      description: 'example.com',
      checked: false,
      onClick: vi.fn(),
    });

    expect(container.textContent).toContain('Keep awake for this URL');
    expect(container.textContent).toContain('example.com');
    const input = container.querySelector('input');
    expect(input?.checked).toBe(false);

    unmount();
  });

  it('triggers onClick when clicked', () => {
    const onClickMock = vi.fn();
    const { container, unmount } = renderComponent({
      title: 'Test Title',
      description: 'Test Description',
      checked: true,
      onClick: onClickMock,
    });

    const label = container.querySelector('label');
    expect(label).toBeTruthy();

    act(() => {
      label?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClickMock).toHaveBeenCalled();
    const input = container.querySelector('input');
    expect(input?.checked).toBe(true);

    unmount();
  });
});
