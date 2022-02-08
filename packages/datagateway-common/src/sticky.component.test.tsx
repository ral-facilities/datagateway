import React from 'react';
import { createShallow } from '@mui/material/test-utils';
import { ReactWrapper } from 'enzyme';
import Sticky from './sticky.component';
import { Paper } from '@mui/material';

describe('Sticky component', () => {
  let shallow;
  const createWrapper = (): ReactWrapper => {
    return shallow(
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

  beforeEach(() => {
    shallow = createShallow({});
  });

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

    createWrapper();
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

  it('handleScroll correctly sets the elavation of component', () => {
    // Allow handleScroll to be called manually
    let handleScrollMock;
    const spyUseCallback = jest
      .spyOn(React, 'useCallback')
      .mockImplementation((f) => {
        handleScrollMock = f;
        return f;
      });
    // Mock the dimensions of the target element
    const spyUseRef = jest.spyOn(React, 'useRef').mockImplementation(() => {
      return { current: currentMock };
    });
    const spyGetRect = jest
      .spyOn(currentMock, 'getBoundingClientRect')
      .mockImplementation(() => {
        return dimensionsMock;
      });

    // Elevation is initially 0 (not stickied)
    const wrapper = createWrapper();
    expect(wrapper.find(Paper).props().elevation).toEqual(0);

    // Mock scrolling beyond bottom of getBoundingClientRect
    Object.defineProperty(global.window, 'scrollY', { value: 2 });
    handleScrollMock();
    expect(wrapper.find(Paper).props().elevation).toEqual(1);

    // Mock scrolling back above bottom of getBoundingClientRect
    Object.defineProperty(global.window, 'scrollY', { value: 0 });
    handleScrollMock();
    expect(wrapper.find(Paper).props().elevation).toEqual(0);

    spyUseCallback.mockRestore();
    spyUseRef.mockRestore();
    spyGetRect.mockRestore();
  });
});
