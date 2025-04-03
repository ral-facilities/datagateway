import React from 'react';
import withIdCheck from './withIdCheck';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import { MemoryRouter } from 'react-router-dom';
import { render, RenderResult } from '@testing-library/react';
import type { Mock, MockInstance } from 'vitest';

describe('withIdCheck', () => {
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

  const createWrapper = (
    Component: React.ComponentType<{ message: string }>,
    locationPath: string
  ): RenderResult => {
    return render(
      <MemoryRouter initialEntries={[locationPath]}>
        <Component message="test" />
      </MemoryRouter>
    );
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
    const SafeComponent = withIdCheck(pendingPromiseMock())(Test);
    const wrapper = createWrapper(SafeComponent, '/');

    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('renders component when checkingPromise resolves to be true', async () => {
    const SafeComponent = withIdCheck(resolvedTruePromiseMock())(Test);
    const wrapper = createWrapper(SafeComponent, '/');

    await act(async () => {
      await flushPromises();
    });

    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('renders error when checkingPromise is rejected', async () => {
    const SafeComponent = withIdCheck(rejectedPromiseMock())(Test);
    const wrapper = createWrapper(
      SafeComponent,
      '/browse/investigation/2/dataset/1/datafile'
    );

    await act(async () => {
      await flushPromises();
    });

    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('renders error when checkingPromise does not resolve to be true', async () => {
    const SafeComponent = withIdCheck(resolvedFalsePromiseMock())(Test);
    const wrapper = createWrapper(
      SafeComponent,
      '/browse/investigation/2/dataset/1/datafile'
    );

    await act(async () => {
      await flushPromises();
    });

    expect(wrapper.asFragment()).toMatchSnapshot();
  });
});
