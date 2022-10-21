import React from 'react';
import debounce from 'lodash.debounce';

function useSticky(targetElement: React.RefObject<HTMLDivElement>): {
  isSticky: boolean;
} {
  const [isSticky, setIsSticky] = React.useState(false);

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

  return { isSticky };
}

export default useSticky;
