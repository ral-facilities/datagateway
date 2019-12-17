import React from 'react';
import {
  StyleRules,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

const namedSizes: { [size: string]: number } = {
  small: 16,
  medium: 24,
  large: 52,
  xLarge: 72,
  xxLarge: 96,
};

const checkmarkStyles = (): StyleRules =>
  createStyles({
    '@keyframes stroke': {
      '100%': {
        strokeDashoffset: 0,
      },
    },
    '@keyframes scale': {
      '0%, 100%': {
        transform: 'none',
      },
      '50%': {
        transform: 'scale3d(1.1, 1.1, 1)',
      },
    },
    '@keyframes fill': {
      '100%': {
        boxShadow: 'inset 0 0 0 100vh #3E863E',
      },
    },
    checkmark: {
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      borderRadius: '50%',
      stroke: '#fff',
      strokeWidth: 5,
      strokeMiterlimit: 10,
      boxShadow: 'inset 0px 0px #3E863E',

      animation:
        '$fill 0.4s ease-in-out 0.4s forwards, $scale 0.3s ease-in-out 0.9s both',
    },
    checkmarkCircle: {
      strokeDasharray: 166,
      strokeDashoffset: 166,
      strokeWidth: 5,
      strokeMiterlimit: 10,
      stroke: '#3E863E',
      fill: 'none',

      animation: '$stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
    },
    checkmarkCheck: {
      transformOrigin: '50% 50%',
      strokeDasharray: 48,
      strokeDashoffset: 48,

      animation: '$stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
    },
  });

interface CheckmarkProps extends WithStyles<typeof checkmarkStyles> {
  size: number | string;
}

const Checkmark: React.FC<CheckmarkProps> = (props: CheckmarkProps) => {
  const actualSize = namedSizes[props.size] || props.size;
  const checkmarkStyle = { width: actualSize, height: actualSize };

  return (
    <svg
      className={props.classes.checkmark}
      xmlns="http://www.w3.org/2000/svg"
      style={checkmarkStyle}
      viewBox="0 0 52 52"
    >
      <circle
        className={props.classes.checkmarkCircle}
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      <path
        className={props.classes.checkmarkCheck}
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  );
};

export default withStyles(checkmarkStyles)(Checkmark);
