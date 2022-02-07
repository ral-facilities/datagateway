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

  it('check if the tooltip is false when onClose is invoked', () => {
    const wrapper = createWrapper(undefined, true);
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
    const wrapper = createWrapper(undefined, false);

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
});
