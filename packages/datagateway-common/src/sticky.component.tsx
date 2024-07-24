import React from 'react';

import { keyframes, Paper, styled } from '@mui/material';
import useSticky from './hooks/useSticky';

const moveDown = keyframes`
  from {
    transform: translateY(-5rem);
  }
  to {
    transform: translateY(0rem);
  }
`;

const StickyPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isSticky',
})<{ isSticky: boolean }>(({ theme, isSticky }) => {
  if (isSticky) {
    return {
      // Allow for the element to always be on top.
      zIndex: 9,
      // NOTE: We can use 'sticky' instead of 'fixed' but this is
      //       not supported in all browsers.
      //       The width must be 100% when using 'fixed'.
      position: 'fixed',
      width: '100%',
      top: 0,

      // Animate the navbar moving down into view.
      animation: `${moveDown} 0.5s ease-in-out`,
    };
  } else {
    return {
      // Allow for the element to always be on top.
      zIndex: 9,
    };
  }
});

const Sticky = (props: { children: React.ReactNode }): React.ReactElement => {
  const targetElement = React.useRef<HTMLDivElement>(null);
  const { isSticky } = useSticky(targetElement);

  return (
    // Wrap navbar components in Paper to allow for when
    // it is sticky to stand out on the page when scrolling.
    <StickyPaper
      data-testid="sticky-paper"
      square
      // Change elevation depending if it is sticky or not.
      elevation={!isSticky ? 0 : 1}
      isSticky={isSticky}
      ref={targetElement}
    >
      {props.children}
    </StickyPaper>
  );
};

export default Sticky;
