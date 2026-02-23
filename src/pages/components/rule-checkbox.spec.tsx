import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { RuleCheckbox } from './rule-checkbox';
import { render } from '../../test/utils';

describe('RuleCheckbox', () => {
  it('renders correctly with given props', () => {
    const { container } = render(<RuleCheckbox
      title="Keep awake for this URL"
      description="example.com"
      checked={false}
      onClick={vi.fn()}
    />);

    expect(container.textContent).toContain('Keep awake for this URL');
    expect(container.textContent).toContain('example.com');
    const input = container.querySelector('input');
    expect(input?.checked).toBe(false);
  });

  it('triggers onClick when clicked', () => {
    const onClickMock = vi.fn();
    const { container } = render(<RuleCheckbox
      title="Test Title"
      description="Test Description"
      checked={true}
      onClick={onClickMock}
    />);

    const label = container.querySelector('label');
    expect(label).toBeTruthy();

    act(() => {
      label?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClickMock).toHaveBeenCalled();
    const input = container.querySelector('input');
    expect(input?.checked).toBe(true);
  });
});
