import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { ArrowTooltip } from '.';
import { Tooltip } from '@mui/material';
import { getTooltipText } from './arrowtooltip.component';

describe('ArrowTooltip component', () => {
  const createWrapper = (
    disableHoverListener?: boolean,
    open?: boolean
  ): ReactWrapper => {
    return mount(
      <ArrowTooltip
        title={'test'}
        disableHoverListener={disableHoverListener}
        open={open}
      >
        <div />
      </ArrowTooltip>
    );
  };

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

    const wrapper = createWrapper();
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);

    spyCreateRef.mockRestore();
  });

  it('can override disableHoverListener', () => {
    let wrapper = createWrapper(true);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(true);

    wrapper = createWrapper(false);
    expect(wrapper.find(Tooltip).props().disableHoverListener).toEqual(false);
  });
});
