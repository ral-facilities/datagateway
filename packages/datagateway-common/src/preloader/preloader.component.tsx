import React from 'react';
import { Box, keyframes, styled } from '@mui/material';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const innerRadius = 140;
const border = 8;
const spacing = 1;

interface PreloaderProps {
  loading: boolean;
  children: React.ReactNode;
}

const rotate = keyframes`
  to {
    transform: rotateZ(360deg);
  }
`;

const StyledI = styled('i')(({ index }: { index: number }) => {
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
    animation: `${rotate} 3s infinite cubic-bezier(.09, ${0.3 * index}, ${
      0.12 * index
    }, .03)`,
    animationName: `${rotate}`,
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationTimingFunction: `cubic-bezier(.09, ${0.3 * index}, ${
      0.12 * index
    }, .03)`,
    transformOrigin: '50% 100% 0',
    boxSizing: 'border-box',
  };
});

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
          <Box
            sx={{
              display: 'block',
              margin: 'auto',
              width: innerRadius + colors.length * 2 * (border + spacing),
              height: innerRadius + colors.length * 2 * (border + spacing),
              animation: `${rotate} 10s infinite linear`,
            }}
          >
            <StyledI index={0} />
            <StyledI index={1} />
            <StyledI index={2} />
            <StyledI index={3} />
            <StyledI index={4} />
          </Box>
        </div>
        <Box sx={{ color: 'text.primary' }}>Loading...</Box>
      </Box>
    ) : (
      props.children
    )}
  </div>
);

export default Preloader;
