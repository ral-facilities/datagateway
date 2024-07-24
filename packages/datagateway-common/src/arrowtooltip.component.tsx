import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { Tooltip, TooltipProps } from '@mui/material';

export const getTooltipText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'boolean')
    return node.toString();
  if (node instanceof Array) return node.map(getTooltipText).join('');
  if (typeof node === 'object' && node && 'props' in node)
    return getTooltipText(node.props.children);
  return '';
};

const tooltipComponentProps = {
  tooltip: {
    sx: {
      position: 'relative',
      backgroundColor: 'common.black',
      fontSize: '0.875rem',
    },
  },
  arrow: {
    sx: {
      color: 'common.black',
    },
  },
};

export const StyledTooltip = React.forwardRef(
  (props: TooltipProps, ref): React.ReactElement => (
    <Tooltip
      ref={ref}
      componentsProps={tooltipComponentProps}
      {...props}
      arrow
    />
  )
);
StyledTooltip.displayName = 'StyledTooltip';

const ArrowTooltip = (
  props: TooltipProps & {
    disableHoverListener?: boolean;
  }
): React.ReactElement => {
  const { disableHoverListener, ...tooltipProps } = props;

  const [isTooltipVisible, setTooltipVisible] = React.useState(false);

  const tooltipResizeObserver = React.useRef<ResizeObserver>(
    new ResizeObserver((entries) => {
      const tooltipTargetElement = entries[0].target;
      // Check that the element has been rendered and set the viewable
      // as false before checking to see the element has exceeded maximum width.
      if (tooltipTargetElement && entries[0].borderBoxSize.length > 0) {
        // Width of the tooltip contents including padding and borders
        // This is rounded as window.innerWidth and tooltip.scrollWidth are always integer
        const currentTargetWidth = Math.round(
          entries[0].borderBoxSize[0].inlineSize
        );
        const minWidthToFitContentOfTarget = tooltipTargetElement.scrollWidth;
        const isContentOfTargetOverflowing =
          minWidthToFitContentOfTarget > currentTargetWidth;

        setTooltipVisible(isContentOfTargetOverflowing);
      }
    })
  );

  // need to use a useCallback instead of a useRef for this
  // see https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const tooltipRef = React.useCallback((container: HTMLDivElement) => {
    if (container !== null) {
      tooltipResizeObserver.current.observe(container);
    } else if (tooltipResizeObserver.current) {
      // When element is unmounted we know container is null so time to clean up
      tooltipResizeObserver.current.disconnect();
    }
  }, []);

  let shouldDisableHoverListener = !isTooltipVisible;
  // Allow disableHoverListener to be overridden
  if (disableHoverListener !== undefined)
    shouldDisableHoverListener = disableHoverListener;

  return (
    <StyledTooltip
      ref={tooltipRef}
      {...tooltipProps}
      disableHoverListener={shouldDisableHoverListener}
    />
  );
};

export default ArrowTooltip;
