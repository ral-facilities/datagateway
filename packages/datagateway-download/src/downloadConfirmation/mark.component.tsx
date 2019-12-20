import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// TypeScript linting will need us to define the return type,
// but as classes may change, there is no need.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useSharedStyles = (colour: string) => {
  const useStyles = makeStyles({
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
        boxShadow: `inset 0 0 0 100vh ${colour}`,
      },
    },
    mark: {
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      borderRadius: '50%',
      stroke: '#fff',
      strokeWidth: 5,
      strokeMiterlimit: 10,
      boxShadow: `inset 0px 0px ${colour}`,

      animation:
        '$fill 0.4s ease-in-out 0.4s forwards, $scale 0.3s ease-in-out 0.9s both',
    },
    markCircle: {
      strokeDasharray: 166,
      strokeDashoffset: 166,
      strokeWidth: 5,
      strokeMiterlimit: 10,
      stroke: colour,
      fill: 'none',

      animation: '$stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
    },
    markSymbol: {
      transformOrigin: '50% 50%',
      strokeDasharray: 48,
      strokeDashoffset: 48,

      animation: '$stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
    },
  });

  return useStyles(colour);
};

interface MarkProps {
  size: number;
  colour: string;
  isCross?: boolean;
}

const Mark: React.FC<MarkProps> = (props: MarkProps) => {
  const checkmarkStyle = { width: props.size, height: props.size };
  const classes = useSharedStyles(props.colour);

  return (
    <svg
      className={classes.mark}
      xmlns="http://www.w3.org/2000/svg"
      style={checkmarkStyle}
      viewBox="0 0 52 52"
    >
      <circle
        className={classes.markCircle}
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      {!props.isCross ? (
        <path
          className={classes.markSymbol}
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      ) : (
        <path
          className={classes.markSymbol}
          fill="none"
          d="M16 16 36 36 M36 16 16 36"
        />
      )}
    </svg>
  );
};

export default Mark;
