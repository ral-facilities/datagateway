import React from 'react';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

const useTooltipStyles: (
  fontSize?: string | undefined
) => Record<'tooltip', string> = (fontSize?: string) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      tooltip: {
        backgroundColor: theme.palette.common.black,
        fontSize: fontSize ? fontSize : '0.875rem',
      },
    })
  );

  return useStyles(fontSize);
};

interface BlackTooltipProps {
  fontSize?: string;
  children?: React.ReactNode;
}

const BlackTooltip: React.FC<BlackTooltipProps & TooltipProps> = (
  props: BlackTooltipProps & TooltipProps
) => {
  const { fontSize, children, ...other } = props;
  const classes = useTooltipStyles(fontSize);

  // Handle tooltip on disabled button elements by placing a span element.
  // https://material-ui.com/components/tooltips/#disabled-elements)
  return (
    <Tooltip classes={classes} {...other}>
      <span>{children}</span>
    </Tooltip>
  );
};

export default BlackTooltip;
