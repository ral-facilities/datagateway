import React from 'react';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

interface BlackTooltipProps {
  fontSize?: string;
  children?: React.ReactNode;
}

const BlackTooltip: React.FC<BlackTooltipProps & TooltipProps> = (
  props: BlackTooltipProps & TooltipProps
) => {
  const { fontSize, children, ...other } = props;

  // Handle tooltip on disabled button elements by placing a span element.
  // https://material-ui.com/components/tooltips/#disabled-elements)
  return (
    <Tooltip
      {...other}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'common.black',
            fontSize: fontSize ? fontSize : '0.875rem',
          },
        },
      }}
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default BlackTooltip;
