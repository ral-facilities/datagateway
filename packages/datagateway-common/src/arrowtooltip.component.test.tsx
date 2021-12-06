import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { ReactWrapper } from 'enzyme';
import { ArrowTooltip } from '.';
import { Tooltip } from '@material-ui/core';
import { getTooltipText } from './arrowtooltip.component';
import { act } from 'react-dom/test-utils';

describe('ArrowTooltip component', () => {
  let mount;

  const createWrapper = (
    percentageWidth?: number,
    maxEnabledHeight?: number,
    disableHoverListener?: boolean,
    open?: boolean
  ): ReactWrapper => {
    return mount(
      <ArrowTooltip
        title={'test'}
        percentageWidth={percentageWidth}
        maxEnabledHeight={maxEnabledHeight}
        disableHoverListener={disableHoverListener}
        open={open}
      >
        <div />
      </ArrowTooltip>
    );
  };

  beforeEach(() => {
    mount = createMount({});
  });

  afterEach(() => {
    mount.cleanUp();
  });

  describe('getTooltipText', () => {
    it('returns empty string for anything null-ish', () => {
      expect(getTooltipText(undefined)).toBe('');
      expect(getTooltipText(null)).toBe('');
      expect(getTooltipText({})).toBe('');
    });

    it('returns value for any primitives', () => {
      expect(getTooltipText(1)).toBe('1');
      expect(getTooltipText(false)).toBe('false');
      expect(getTooltipText('test')).toBe('test');
    });

    it('returns nested value for any react nodes', () => {
      expect(getTooltipText(<b>{'Test'}</b>)).toBe('Test');
      expect(
        getTooltipText(
          <div>
            <b>
              <i>{'Test'}</i>
            </b>
          </div>
        )
      ).toBe('Test');
    });

    it('returns concatted nested values for any react node lists', () => {
      expect(
        getTooltipText(
          <React.Fragment>
            <b>{'Test'}</b>
            <b>{1}</b>
          </React.Fragment>
        )
      ).toBe('Test1');
    });
  });

  // Note that disableHoverListener has the opposite value to isTooltipVisible

  it('tooltip disabled when tooltipElement null', () => {
    // Mock return of createRef to be null
    const spyCreateRef = jest
      .spyOn(React, 'createRef')
      .mockReturnValueOnce(null);

    const wrapper = createWrapper(undefined, undefined);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);

    spyCreateRef.mockRestore();
  });

  it('check if the tooltip is false when onClose is invoked', () => {
    const wrapper = createWrapper(undefined, undefined, undefined, true);
    act(() => {
      wrapper.find(Tooltip)?.invoke('onClose')();
    });
    wrapper.update();

    expect(wrapper.find(Tooltip).props().open).toEqual(false);
  });

  it('check if the tooltip is true when onOpen is invoked and check when escape is press the tooltip is false', () => {
    let handleKeydown;
    const spyUseCallback = jest
      .spyOn(React, 'useCallback')
      .mockImplementation((f) => {
        handleKeydown = f;
        return f;
      });
    const wrapper = createWrapper(undefined, undefined, undefined, false);

    act(() => {
      wrapper.find(Tooltip)?.invoke('onOpen')();
    });
    wrapper.update();
    expect(wrapper.find(Tooltip).props().open).toEqual(true);

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'Escape' });
      handleKeydown(e);
    });

    wrapper.update();

    expect(wrapper.find(Tooltip).props().open).toEqual(false);

    spyUseCallback.mockRestore();
  });

  it('tooltip enabled when offsetWidth/windowWidth >= percentageWidth', () => {
    // Set percentageWidth negative to trigger when offsetWidth is 0
    const wrapper = createWrapper(-1, undefined);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(false);
  });

  it('tooltip disabled when offsetWidth/windowWidth < percentageWidth', () => {
    // Initialise state to true so we can check it's later set to false
    const spyUseState = jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(
        () => React.useState(true) as [unknown, React.Dispatch<unknown>]
      );

    const wrapper = createWrapper(1, undefined);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);

    spyUseState.mockRestore();
  });

  it('tooltip disabled when offsetHeight >= maxEnabledHeight', () => {
    // Enable with negative percentageWidth, then overide with negative maxEnabledHeight
    const wrapper = createWrapper(-1, -1);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);
  });

  it('tooltip unchanged when offsetHeight < maxEnabledHeight', () => {
    // Enable with negative percentageWidth, don't overide with maxEnabledHeight
    const wrapper = createWrapper(-1, 1);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(false);
  });

  it('tooltip enabled when offsetWidth < scrollWidth', () => {
    // Mock the value of scrollWidth
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1,
    });

    const wrapper = createWrapper(undefined, undefined);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(false);
  });

  it('tooltip disabled when offsetWidth >= scrollWidth', () => {
    // Mock the value of scrollWidth
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 0,
    });

    const wrapper = createWrapper(undefined, undefined);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);
  });

  it('tooltip disabled when disableHoverListener = false', () => {
    // From 'tooltip disabled when offsetHeight >= maxEnabledHeight' this is a case that should enable the
    // hover listener, but force it to be disabled
    const wrapper = createWrapper(-1, -1, false);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(false);
  });

  it('tooltip enabled when disableHoverListener = true', () => {
    // From 'tooltip unchanged when offsetHeight < maxEnabledHeight' this is a case that should disable the
    // hover listener, but force it to be enabled
    const wrapper = createWrapper(-1, 1, true);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);
  });

  it('tooltip recalculates when resize or columnResize actions sent', () => {
    // Mock the value of scrollWidth
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 0,
    });
    const wrapper = createWrapper();
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);

    // Mock the value of scrollWidth
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
      // need to use setProps to force enzyme to rerender
      wrapper.setProps({});
    });

    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(false);

    // Mock the value of scrollWidth
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 0,
    });

    act(() => {
      window.dispatchEvent(new Event('columnResize'));
      wrapper.setProps({});
    });

    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);
  });
});
