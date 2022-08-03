import React from 'react';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material';

const stroke = keyframes`
  100% {
    stroke-dashoffset: 0;
  }`;

const scale = keyframes`
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }`;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fill = (colour?: string) => keyframes`
  100% {
    box-shadow: inset 0 0 0 100vh ${colour ? colour : 'inherit'};
  }`;

const MarkSVG = styled('svg', {
  shouldForwardProp: (prop) =>
    prop !== 'colour' && prop !== 'visible' && prop !== 'size',
})<{ visible: boolean; size: number; colour?: string }>(
  ({ visible, size, colour }) => ({
    display: 'block',
    width: size,
    height: size,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '50%',
    stroke: '#fff',
    strokeWidth: 5,
    strokeMiterlimit: 10,
    boxShadow: `inset 0px 0px ${colour ? colour : 'inherit'}`,
    visibility: visible ? 'visible' : 'hidden',

    animation: `${fill(
      colour
    )} 0.4s ease-in-out 0.4s forwards, ${scale} 0.3s ease-in-out 0.9s both`,
  })
);

const MarkCircle = styled('circle', {
  shouldForwardProp: (prop) => prop !== 'colour',
})<{ colour?: string }>(({ colour }) => ({
  strokeDasharray: 166,
  strokeDashoffset: 166,
  strokeWidth: 5,
  strokeMiterlimit: 10,
  stroke: colour ? colour : 'inherit',
  fill: 'none',

  animation: `${stroke} 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards`,
}));

const MarkSymbol = styled('path')(() => ({
  transformOrigin: '50% 50%',
  strokeDasharray: '48px',
  strokeDashoffset: '48px',

  animation: `${stroke} 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards`,
}));

interface MarkProps {
  size: number;
  visible: boolean;
  colour?: string;
  isCross?: boolean;
}

const Mark: React.FC<MarkProps> = (props: MarkProps) => {
  return (
    <MarkSVG
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      size={props.size}
      visible={props.visible}
      colour={props.colour}
    >
      <MarkCircle cx="26" cy="26" r="25" fill="none" colour={props.colour} />
      {!props.isCross ? (
        <MarkSymbol fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      ) : (
        <MarkSymbol fill="none" d="M16 16 36 36 M36 16 16 36" />
      )}
    </MarkSVG>
  );
};

export default Mark;
