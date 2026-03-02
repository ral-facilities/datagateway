import { act, render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { Mock, MockInstance } from 'vitest';
import { flushPromises } from '../setupTests';
import WithIdCheck from './withIdCheck';

describe('WithIdCheck', () => {
  let useEffect: MockInstance;

  const Test: React.FC<{ message: string }> = (props: { message: string }) => (
    <div>{props.message}</div>
  );
  let pendingPromiseMock: Mock;
  let resolvedTruePromiseMock: Mock;
  let resolvedFalsePromiseMock: Mock;
  let rejectedPromiseMock: Mock;

  const mockUseEffect = (): void => {
    useEffect.mockImplementationOnce((f) => f());
  };

  beforeEach(() => {
    useEffect = vi.spyOn(React, 'useEffect');
    pendingPromiseMock = vi.fn().mockImplementation(
      () =>
        new Promise((_resolve, _reject) => {
          // do nothing
        })
    );
    resolvedTruePromiseMock = vi.fn().mockResolvedValue(true);
    resolvedFalsePromiseMock = vi.fn().mockResolvedValue(false);
    rejectedPromiseMock = vi.fn().mockRejectedValue('');

    mockUseEffect(); // initial run
    mockUseEffect(); // promise resolve/reject
    mockUseEffect(); // promise finally
  });

  it('renders loading indicator when loading', () => {
    const view = render(
      <WithIdCheck checkingPromise={pendingPromiseMock()}>
        <Test message="test" />
      </WithIdCheck>,
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
        ),
      }
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders component when checkingPromise resolves to be true', async () => {
    const view = render(
      <WithIdCheck checkingPromise={resolvedTruePromiseMock()}>
        <Test message="test" />
      </WithIdCheck>,
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
        ),
      }
    );

    await act(async () => {
      await flushPromises();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders error when checkingPromise is rejected', async () => {
    const view = render(
      <WithIdCheck checkingPromise={rejectedPromiseMock()}>
        <Test message="test" />
      </WithIdCheck>,
      {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={['/browse/investigation/2/dataset/1/datafile']}
          >
            {children}
          </MemoryRouter>
        ),
      }
    );

    await act(async () => {
      await flushPromises();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders error when checkingPromise does not resolve to be true', async () => {
    const view = render(
      <WithIdCheck checkingPromise={resolvedFalsePromiseMock()}>
        <Test message="test" />
      </WithIdCheck>,
      {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={['/browse/investigation/2/dataset/1/datafile']}
          >
            {children}
          </MemoryRouter>
        ),
      }
    );

    await act(async () => {
      await flushPromises();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
