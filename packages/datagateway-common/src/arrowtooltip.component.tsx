import React, { useEffect } from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const arrowGenerator = (
  color: string
): Record<string, Record<string, string | number | Record<string, string>>> => {
  return {
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.95em',
      width: '2em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${color} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.95em',
      width: '2em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${color} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.95em',
      height: '2em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${color} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.95em',
      height: '2em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${color}`,
      },
    },
  };
};

const useStylesArrow = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      position: 'relative',
      backgroundColor: theme.palette.common.black,
      fontSize: '0.875rem',
    },
    popper: arrowGenerator(theme.palette.common.black),
    arrow: {
      position: 'absolute',
      fontSize: 6,
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid',
      },
    },
  })
);

const ArrowTooltip = (
  props: TooltipProps & { percentageWidth?: number; maxEnabledHeight?: number }
): React.ReactElement => {
  const { percentageWidth, maxEnabledHeight } = props;

  const { arrow, ...classes } = useStylesArrow();
  const [arrowRef, setArrowRef] = React.useState<HTMLSpanElement | null>(null);

  const tooltipElement: React.RefObject<HTMLElement> = React.createRef();
  const [isTooltipVisible, setTooltipVisible] = React.useState(false);

  useEffect(() => {
    function updateTooltip(): void {
      // Check that the element has been rendered and set the viewable
      // as false before checking to see the element has exceeded maximum width.
      if (tooltipElement !== null && tooltipElement.current !== null) {
        // We pass in a percentage width (as a prop) of the viewport width,
        // which is set as the max width the tooltip will allow content which
        // is wrapped within it until it makes the tooltip visible.
        if (percentageWidth) {
          // Check to ensure whether the tooltip should be visible given the width provided.
          if (
            tooltipElement.current.offsetWidth / window.innerWidth >=
            percentageWidth / 100
          )
            setTooltipVisible(true);
          else setTooltipVisible(false);
        }

        if (maxEnabledHeight) {
          if (tooltipElement.current.offsetHeight > maxEnabledHeight) {
            setTooltipVisible(false);
          }
        }

        if (!percentageWidth && !maxEnabledHeight) setTooltipVisible(true);
      }
    }
    window.addEventListener('resize', updateTooltip);
    updateTooltip();
    return () => window.removeEventListener('resize', updateTooltip);
  }, [tooltipElement, setTooltipVisible, percentageWidth, maxEnabledHeight]);

  return (
    <Tooltip
      ref={tooltipElement}
      classes={classes}
      PopperProps={{
        popperOptions: {
          modifiers: {
            arrow: {
              enabled: Boolean(arrowRef),
              element: arrowRef,
            },
          },
        },
      }}
      {...props}
      title={
        <React.Fragment>
          {props.title}
          <span className={arrow} ref={setArrowRef} />
        </React.Fragment>
      }
      disableHoverListener={!isTooltipVisible}
    />
  );
};

export default ArrowTooltip;
