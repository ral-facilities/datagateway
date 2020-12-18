import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { ReactWrapper } from 'enzyme';
import { ArrowTooltip } from '.';
import { Tooltip } from '@material-ui/core';

describe('ArrowTooltip component', () => {
  let mount;
  const createWrapper = (
    percentageWidth?: number,
    maxEnabledHeight?: number
  ): ReactWrapper => {
    return mount(
      <ArrowTooltip
        title={'test'}
        percentageWidth={percentageWidth}
        maxEnabledHeight={maxEnabledHeight}
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
});
