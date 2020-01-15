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
  props: TooltipProps & { breadcrumbWidth: number }
): React.ReactElement => {
  const { breadcrumbWidth } = props;
  const { arrow, ...classes } = useStylesArrow();
  const [arrowRef, setArrowRef] = React.useState<HTMLSpanElement | null>(null);

  const tooltipElement: React.RefObject<HTMLElement> = React.createRef();
  const [isTooltipVisibile, setTooltipVisible] = React.useState(false);

  useEffect(() => {
    function updateTooltip(): void {
      // Check that the element has been rendered and set the viewable
      // as false before checking to see the element has exceeded maximum width.
      if (tooltipElement !== null && tooltipElement.current !== null) {
        // The 0.2 here means 20% of the viewport width, which is set as
        // the max width for the breadcrumb in the CSS style.

        // Check to ensure whether the tooltip should be visible.
        if (
          tooltipElement.current.offsetWidth / window.innerWidth >=
          breadcrumbWidth
        )
          setTooltipVisible(true);
        else setTooltipVisible(false);
      }
    }
    window.addEventListener('resize', updateTooltip);
    updateTooltip();
    return () => window.removeEventListener('resize', updateTooltip);
  }, [tooltipElement, setTooltipVisible, breadcrumbWidth]);

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
      disableHoverListener={!isTooltipVisibile}
    />
  );
};

export default ArrowTooltip;
