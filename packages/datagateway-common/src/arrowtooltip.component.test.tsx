import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { ReactWrapper } from 'enzyme';
import { ArrowTooltip } from '.';
import { Tooltip } from '@material-ui/core';

describe('ArrowTooltip component', () => {
  let mount;
  const createWrapper = (
    percentageWidth?: number,
    maxEnabledHeight?: number,
    disableHoverListener?: boolean
  ): ReactWrapper => {
    return mount(
      <ArrowTooltip
        title={'test'}
        percentageWidth={percentageWidth}
        maxEnabledHeight={maxEnabledHeight}
        disableHoverListener={disableHoverListener}
      >
        <div />
      </ArrowTooltip>
    );
  };

  beforeEach(() => {
    mount = createMount({});
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
});
