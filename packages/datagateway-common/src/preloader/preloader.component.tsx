import React from 'react';
import { Box } from '@mui/material';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const innerRadius = 140;
const border = 8;
const spacing = 1;

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
    position: 'absolute',
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
    boxSizing: 'border-box',
  };
};

const Preloader: React.FC<PreloaderProps> = (props: PreloaderProps) => (
  <div role={props.loading ? 'progressbar' : undefined}>
    {props.loading ? (
      <Box
        sx={{
          zIndex: 1000,
          width: '100%',
          height: '100%',
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ boxSizing: 'border-box', padding: '10px 0' }}>
          <div
            style={{
              display: 'block',
              margin: 'auto',
              width: innerRadius + colors.length * 2 * (border + spacing),
              height: innerRadius + colors.length * 2 * (border + spacing),
              animation: 'rotate 10s infinite linear',
            }}
          >
            <i style={spinnerStyle(0)} />
            <i style={spinnerStyle(1)} />
            <i style={spinnerStyle(2)} />
            <i style={spinnerStyle(3)} />
            <i style={spinnerStyle(4)} />
          </div>
        </div>
        <Box sx={{ color: 'text.primary' }}>Loading...</Box>
      </Box>
    ) : (
      props.children
    )}
  </div>
);

export default Preloader;
