import {
  type ButtonProps,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowTooltip } from 'datagateway-common';
import React from 'react';

interface ToolbarButtonProps
  extends Omit<ButtonProps, 'startIcon' | 'children'> {
  icon: JSX.Element;
  label: string;
}

/**
 * A button in the previewer toolbar that hides the text label when the viewport
 * gets too small.
 *
 * Accepts all the props that a normal MUI {@link Button} would
 * except `startIcon` and `children`.
 */
function ToolbarButton({
  icon,
  label,
  sx,
  ...buttonProps
}: ToolbarButtonProps): JSX.Element {
  const theme = useTheme();
  const isBreakpointMatched = useMediaQuery(theme.breakpoints.down('md'));

  return isBreakpointMatched ? (
    <ArrowTooltip title="test">
      <Button {...buttonProps} sx={{ minWidth: 'auto', ...sx }}>
        {icon}
      </Button>
    </ArrowTooltip>
  ) : (
    <Button {...buttonProps} startIcon={icon}>
      {label}
    </Button>
  );
}

export default ToolbarButton;
