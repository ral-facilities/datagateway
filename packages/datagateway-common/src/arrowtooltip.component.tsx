import React, { useEffect } from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStylesArrow = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      position: 'relative',
      backgroundColor: theme.palette.common.black,
      fontSize: '0.875rem',
    },
    arrow: {
      color: theme.palette.common.black,
    },
  })
);
export const getTooltipText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'boolean')
    return node.toString();
  if (node instanceof Array) return node.map(getTooltipText).join('');
  if (typeof node === 'object' && node && 'props' in node)
    return getTooltipText(node.props.children);
  return '';
};

const ArrowTooltip = (
  props: TooltipProps & {
    percentageWidth?: number;
    maxEnabledHeight?: number;
    disableHoverListener?: boolean;
  }
): React.ReactElement => {
  const {
    percentageWidth,
    maxEnabledHeight,
    disableHoverListener,
    ...tooltipProps
  } = props;

  const { ...classes } = useStylesArrow();

  const tooltipElement: React.RefObject<HTMLElement> = React.createRef();
  const [isTooltipVisible, setTooltipVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onClose = (): void => {
    window.removeEventListener('keydown', handleKeyDown);
    setOpen(false);
  };

  const onOpen = (): void => {
    window.addEventListener('keydown', handleKeyDown);
    setOpen(true);
  };

  useEffect(() => {
    function updateTooltip(): void {
      // Check that the element has been rendered and set the viewable
      // as false before checking to see the element has exceeded maximum width.
      if (tooltipElement !== null) {
        // We pass in a percentage width (as a prop) of the viewport width,
        // which is set as the max width the tooltip will allow content which
        // is wrapped within it until it makes the tooltip visible.
        if (percentageWidth) {
          // Check to ensure whether the tooltip should be visible given the width provided.
          if (
            tooltipElement.current &&
            tooltipElement.current.offsetWidth / window.innerWidth >=
              percentageWidth / 100
          )
            setTooltipVisible(true);
          else setTooltipVisible(false);
        }

        if (maxEnabledHeight) {
          if (
            tooltipElement.current &&
            tooltipElement.current.offsetHeight > maxEnabledHeight
          ) {
            setTooltipVisible(false);
          }
        }

        if (!percentageWidth && !maxEnabledHeight) {
          // If props haven't been given, have tooltip appear only when visible
          // text width is smaller than full text width.
          if (
            tooltipElement.current &&
            tooltipElement.current.offsetWidth <
              tooltipElement.current.scrollWidth
          ) {
            setTooltipVisible(true);
          } else {
            setTooltipVisible(false);
          }
        }
      }
    }
    window.addEventListener('resize', updateTooltip);
    window.addEventListener('columnResize', updateTooltip);
    updateTooltip();
    return () => {
      window.removeEventListener('resize', updateTooltip);
      window.removeEventListener('columnResize', updateTooltip);
    };
  }, [
    tooltipElement,
    setTooltipVisible,
    percentageWidth,
    maxEnabledHeight,
    disableHoverListener,
  ]);

  let shouldDisableHoverListener = !isTooltipVisible;
  //Allow disableHoverListener to be overidden
  if (disableHoverListener !== undefined)
    shouldDisableHoverListener = disableHoverListener;

  return (
    <Tooltip
      ref={tooltipElement}
      classes={classes}
      {...tooltipProps}
      disableHoverListener={shouldDisableHoverListener}
      arrow={true}
      onOpen={onOpen}
      onClose={onClose}
      open={open}
    />
  );
};

export default ArrowTooltip;
