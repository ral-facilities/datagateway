import React from 'react';
import ArrowTooltip, { getTooltipText } from './arrowtooltip.component';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// a simple ResizeObserver mock implemented to emulate ResizeObserver behaviour for
// our tests correctly
const ResizeObserverMock = vi.fn(function (callback) {
  this.callback = callback;

  this.observe = (target: HTMLElement) => {
    this.callback(
      [
        {
          target: {
            scrollWidth: 100,
          },
          borderBoxSize: [
            {
              inlineSize: Number(target.style.width.replace('px', '')),
            },
          ],
        },
      ],
      this
    );
  };

  this.disconnect = () => {
    // disconnected
  };
});

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('ArrowTooltip component', () => {
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

  it('is enabled when the target of the tooltip is overflowing', async () => {
    const user = userEvent.setup();

    render(
      <ArrowTooltip title="tooltip content">
        <p style={{ width: 10, height: 10 }}>
          Some really long text that will for sure overflow
        </p>
      </ArrowTooltip>
    );

    await user.hover(
      screen.getByText('Some really long text that will for sure overflow')
    );

    expect(await screen.findByText('tooltip content')).toBeInTheDocument();
  });

  describe('is disabled', () => {
    it('when the target of the tooltip is not overflowing', async () => {
      const user = userEvent.setup();

      render(
        <ArrowTooltip title="tooltip content">
          <p style={{ width: 1000, height: 10 }}>
            Some really long text that will for sure overflow
          </p>
        </ArrowTooltip>
      );

      await user.hover(
        screen.getByText('Some really long text that will for sure overflow')
      );

      // tooltip doesn't immediately appear in the DOM after it is triggered
      // since queryByText immediately queries the dom after the hover event happens,
      // we need to make sure that `queryByText` returns null because
      // the tooltip **won't ever** appear, not because the tooltip hasn't appeared yet when queryByText queries the dom
      //
      // waiting for 2 seconds should be enough

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      expect(screen.queryByText('tooltip content')).toBeNull();
    });

    it('when it is disabled explicitly', async () => {
      const user = userEvent.setup();

      render(
        <ArrowTooltip title="tooltip content" disableHoverListener>
          <p style={{ width: 10, height: 10 }}>
            Some really long text that will for sure overflow
          </p>
        </ArrowTooltip>
      );

      await user.hover(
        screen.getByText('Some really long text that will for sure overflow')
      );

      // tooltip doesn't immediately appear in the DOM after it is triggered
      // since queryByText immediately queries the dom after the hover event happens,
      // we need to make sure that `queryByText` returns null because
      // the tooltip **won't ever** appear, not because the tooltip hasn't appeared yet when queryByText queries the dom
      //
      // waiting for 2 seconds should be enough

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      expect(screen.queryByText('tooltip content')).toBeNull();
    });
  });
});
