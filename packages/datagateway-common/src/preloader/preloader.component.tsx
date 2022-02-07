import React from 'react';
import { Theme } from '@mui/material/styles';

import { StyleRules, WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const innerRadius = 140;
const border = 8;
const spacing = 1;

const styles = (theme: Theme): StyleRules =>
  createStyles({
    spinner: {
      display: 'block',
      margin: 'auto',
      width: innerRadius + colors.length * 2 * (border + spacing),
      height: innerRadius + colors.length * 2 * (border + spacing),
      animation: 'rotate 10s infinite linear',
    },
    wrapper: {
      boxSizing: 'border-box' as const,
      padding: '10px 0',
    },
    container: {
      zIndex: 1000,
      width: '100%',
      height: '100%',
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.palette.text.primary,
    },
  });

interface PreloaderProps {
  loading: boolean;
  children: React.ReactNode;
}

interface SpinnerStyle {
  [id: string]: string | number;
}

const spinnerStyle = (index: number): SpinnerStyle => {
  const size = innerRadius + index * 2 * (border + spacing);

  return {
    position: 'absolute' as const,
    display: 'inline-block',
    top: '50%',
    left: '50%',
    border: `solid ${border}px transparent`,
    borderBottom: 'none',
    borderTopLeftRadius: innerRadius + index * border,
    borderTopRightRadius: innerRadius + index * border,
    borderColor: colors[index % colors.length],
    height: size / 2,
    width: size,
    marginTop: -size / 2,
    marginLeft: -size / 2,
    animationName: 'rotate',
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationTimingFunction: `cubic-bezier(.09, ${0.3 * index}, ${
      0.12 * index
    }, .03)`,
    transformOrigin: '50% 100% 0',
    boxSizing: 'border-box' as const,
  };
};

const Preloader: React.FC<PreloaderProps & WithStyles<typeof styles>> = (
  props: PreloaderProps & WithStyles<typeof styles>
) => (
  <div>
    {props.loading ? (
      <div className={props.classes.container}>
        <div className={props.classes.wrapper}>
          <div className={props.classes.spinner}>
            <i style={spinnerStyle(0)} />
            <i style={spinnerStyle(1)} />
            <i style={spinnerStyle(2)} />
            <i style={spinnerStyle(3)} />
            <i style={spinnerStyle(4)} />
          </div>
        </div>
        <div className={props.classes.text}>Loading...</div>
      </div>
    ) : (
      props.children
    )}
  </div>
);

export default withStyles(styles)(Preloader);
