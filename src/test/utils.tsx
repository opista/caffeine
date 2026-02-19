import { createRoot } from 'react-dom/client';
import { act } from 'react';

export function renderHook<Result, Props>(
  render: (props: Props) => Result,
  options?: { initialProps?: Props }
) {
  const result = { current: null as Result };
  const container = document.createElement('div');
  const root = createRoot(container);

  function TestComponent({ renderProps }: { renderProps: Props }) {
    result.current = render(renderProps);
    return null;
  }

  function rerender(props?: Props) {
    const renderProps = props ?? options?.initialProps;
    act(() => {
      root.render(<TestComponent renderProps={renderProps!} />);
    });
  }

  function unmount() {
    act(() => {
      root.unmount();
    });
  }

  rerender();

  return { result, unmount, rerender };
}
