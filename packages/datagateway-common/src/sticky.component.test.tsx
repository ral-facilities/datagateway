import React from 'react';
import { mount, shallow, ReactWrapper } from 'enzyme';
import Sticky, { useSticky } from './sticky.component';
import { Paper } from '@mui/material';
import { act, renderHook } from '@testing-library/react-hooks';

describe('Sticky component', () => {
  const createShallowWrapper = (): ReactWrapper => {
    return shallow(
      <Sticky>
        <div />
      </Sticky>
    );
  };

  const createWrapper = (): ReactWrapper => {
    return mount(
      <Sticky>
        <div />
      </Sticky>
    );
  };

  const currentMock: HTMLDivElement = document.createElement('div');
  const dimensionsMock = {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 1,
    left: 0,
    right: 0,
    top: 0,
    toJSON: jest.fn(),
  };

  it('eventListener added and removed with useEffect', () => {
    // Allow cleanUp to be called manually
    let cleanUp;
    const spyUseEffect = jest
      .spyOn(React, 'useEffect')
      .mockImplementation((f) => {
        cleanUp = f();
      });
    const spyAdd = jest.spyOn(window, 'addEventListener');
    const spyRemove = jest.spyOn(window, 'removeEventListener');

    createShallowWrapper();
    expect(spyAdd).toHaveBeenCalledTimes(1);
    expect(spyRemove).toHaveBeenCalledTimes(0);

    cleanUp();
    expect(spyAdd).toHaveBeenCalledTimes(1);
    expect(spyRemove).toHaveBeenCalledTimes(1);

    spyUseEffect.mockRestore();
    spyAdd.mockRestore();
    spyRemove.mockRestore();
  });

  it('handleScroll does nothing when target undefined', () => {
    // Allow handleScroll to be called manually
    let handleScrollMock;
    const spyUseCallback = jest
      .spyOn(React, 'useCallback')
      .mockImplementation((f) => {
        handleScrollMock = f;
        return f;
      });

    // Elevation is initially 0 (not stickied)
    const wrapper = createWrapper();
    expect(wrapper.find(Paper).props().elevation).toEqual(0);

    // Mock scrolling beyond bottom of getBoundingClientRect
    Object.defineProperty(global.window, 'scrollY', { value: 2 });
    handleScrollMock();
    expect(wrapper.find(Paper).props().elevation).toEqual(0);

    spyUseCallback.mockRestore();
  });

  it('useSticky works correctly', () => {
    // Allow handleScroll to be called manually
    let handleScrollMock;
    const spyUseCallback = jest
      .spyOn(React, 'useCallback')
      .mockImplementation((f) => {
        handleScrollMock = f;
        return f;
      });
    const spyGetRect = jest
      .spyOn(currentMock, 'getBoundingClientRect')
      .mockImplementation(() => {
        return dimensionsMock;
      });
    const { result } = renderHook(() => useSticky({ current: currentMock }));

    Object.defineProperty(global.window, 'scrollY', { value: 0 });
    act(() => {
      handleScrollMock();
    });

    expect(result.current.isSticky).toEqual(false);

    Object.defineProperty(global.window, 'scrollY', { value: 2 });
    act(() => {
      handleScrollMock();
    });

    expect(result.current.isSticky).toEqual(true);

    spyUseCallback.mockRestore();
    spyGetRect.mockRestore();
  });

  // Sticky functionality tested in dataview e2e breadcrumbs tests
});
