import React from 'react';
import withIdCheck from './withIdCheck';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router-dom';
import { render, RenderResult } from '@testing-library/react';

describe('withIdCheck', () => {
  let useEffect: jest.SpyInstance;

  const Test: React.FC<{ message: string }> = (props: { message: string }) => (
    <div>{props.message}</div>
  );
  let pendingPromiseMock: jest.Mock;
  let resolvedTruePromiseMock: jest.Mock;
  let resolvedFalsePromiseMock: jest.Mock;
  let rejectedPromiseMock: jest.Mock;

  const mockUseEffect = (): void => {
    useEffect.mockImplementationOnce((f) => f());
  };

  const createWrapper = (component, locationPath): RenderResult => {
    return render(
      <MemoryRouter initialEntries={[locationPath]}>
        <component.WrappedComponent
          message="test"
          location={createLocation(locationPath)}
        />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    useEffect = jest.spyOn(React, 'useEffect');
    pendingPromiseMock = jest.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          // do nothing
        })
    );
    resolvedTruePromiseMock = jest.fn().mockResolvedValue(true);
    resolvedFalsePromiseMock = jest.fn().mockResolvedValue(false);
    rejectedPromiseMock = jest.fn().mockRejectedValue('');

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
