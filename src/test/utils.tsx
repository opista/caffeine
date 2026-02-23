import { createRoot } from 'react-dom/client';
import { act } from 'react';

export function renderHook<Result, Props>(
  render: (props: Props) => Result,
  options?: { initialProps?: Props }
) {
  const result = { current: null as Result };
  const container = document.createElement('div');
  const root = createRoot(container);

  const TestComponent = ({ renderProps }: { renderProps: Props }) => {
    result.current = render(renderProps);
    return null;
  }

  const rerender = (props?: Props) => act(() => root.render(<TestComponent renderProps={props ?? options?.initialProps!} />));
  const unmount = () => act(() => root.unmount());

  rerender();

  return { result, unmount, rerender };
}
