import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { afterEach } from 'vitest';
import { ReactNode } from 'react';

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

let container: HTMLDivElement | null = null;
let root: any = null;

export function render(component: ReactNode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(component);
  });

  return {
    container,
    // Provide explicit unmount if needed, but cleanup handles it too
    unmount: () => {
       act(() => {
        root.unmount();
      });
      if (container) {
          container.remove();
          container = null;
      }
      root = null;
    }
  };
}

export function cleanup() {
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
}

// Automatically register cleanup for tests that use this file
afterEach(() => {
  cleanup();
});
