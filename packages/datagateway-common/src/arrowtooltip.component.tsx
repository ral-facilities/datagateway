import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { Tooltip, TooltipProps, tooltipClasses, styled } from '@mui/material';

export const getTooltipText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'boolean')
    return node.toString();
  if (node instanceof Array) return node.map(getTooltipText).join('');
  if (typeof node === 'object' && node && 'props' in node)
    return getTooltipText(node.props.children);
  return '';
};

export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} arrow={true} />
))(({ theme }) => ({
  margin: 'auto',
  [`& .${tooltipClasses.tooltip}`]: {
    position: 'relative',
    backgroundColor: theme.palette.common.black,
    fontSize: '0.875rem',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
}));

const ArrowTooltip = (
  props: TooltipProps & {
    disableHoverListener?: boolean;
  }
): React.ReactElement => {
  const { disableHoverListener, ...tooltipProps } = props;

  const [isTooltipVisible, setTooltipVisible] = React.useState(false);

  const tooltipResizeObserver = React.useRef<ResizeObserver>(
    new ResizeObserver((entries) => {
      const tooltipElement = entries[0].target;
      // Check that the element has been rendered and set the viewable
      // as false before checking to see the element has exceeded maximum width.
      if (
        tooltipElement !== null &&
        entries.length > 0 &&
        entries[0].borderBoxSize.length > 0
      ) {
        // Width of the tooltip contents including padding and borders
        // This is rounded as window.innerWidth and tooltip.scrollWidth are always integer
        const borderBoxWidth = Math.round(
          entries[0].borderBoxSize[0].inlineSize
        );

        // have tooltip appear only when visible text width is smaller than full text width.
        if (tooltipElement && borderBoxWidth < tooltipElement.scrollWidth) {
          setTooltipVisible(true);
        } else {
          setTooltipVisible(false);
        }
      }
    })
  );

  // need to use a useCallback instead of a useRef for this
  // see https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const tooltipRef = React.useCallback((container: HTMLDivElement) => {
    if (container !== null) {
      tooltipResizeObserver.current.observe(container);
    }
    // When element is unmounted we know container is null so time to clean up
    else {
      if (tooltipResizeObserver.current)
        tooltipResizeObserver.current.disconnect();
    }
  }, []);

  let shouldDisableHoverListener = !isTooltipVisible;
  //Allow disableHoverListener to be overidden
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
