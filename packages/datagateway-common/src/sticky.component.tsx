import React from 'react';

import { Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import debounce from 'lodash.debounce';
import clsx from 'clsx';

function useSticky(): {
  isSticky: boolean;
  targetElement: React.RefObject<HTMLDivElement>;
} {
  const [isSticky, setIsSticky] = React.useState(false);
  const targetElement = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback((): void => {
    if (
      targetElement.current &&
      targetElement.current.getBoundingClientRect().bottom
    ) {
      if (
        window.scrollY > targetElement.current.getBoundingClientRect().bottom
      ) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    }
  }, [targetElement]);

  React.useEffect(() => {
    // Use lodash.debounce for handleScroll with a wait of 20ms.
    window.addEventListener('scroll', debounce(handleScroll, 20));

    return () => {
      window.removeEventListener('scroll', () => handleScroll);
    };
  }, [handleScroll]);

  return { isSticky, targetElement };
}

const useStickyStyles = makeStyles({
  '@keyframes moveDown': {
    from: {
      transform: 'translateY(-5rem)',
    },
    to: {
      transform: 'translateY(0rem)',
    },
  },
  content: {
    // Allow for the element to always be on top.
    zIndex: 9,
  },
  contentSticky: {
    // NOTE: We can use 'sticky' instead of 'fixed' but this is
    //       not supported in all browsers.
    //       The width must be 100% when using 'fixed'.
    position: 'fixed',
    width: '100%',
    top: 0,

    // Animate the navbar moving down into view.
    animation: '$moveDown 0.5s ease-in-out',
  },
});

const Sticky = (props: { children: React.ReactNode }): React.ReactElement => {
  const classes = useStickyStyles();
  const { isSticky, targetElement } = useSticky();

  return (
    // Wrap navbar components in Paper to allow for when
    // it is sticky to stand out on the page when scrolling.
    <Paper
      square
      // Change elevation depending if it is sticky or not.
      elevation={!isSticky ? 0 : 1}
      className={clsx(classes.content, isSticky && classes.contentSticky)}
      ref={targetElement}
    >
      {props.children}
    </Paper>
  );
};

export default Sticky;
