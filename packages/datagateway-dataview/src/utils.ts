import React from 'react';

const useAfterMountEffect = (
  func: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: any[]
): void => {
  const hasMounted = React.useRef(false);

  React.useEffect(() => {
    if (hasMounted.current) {
      func();
    } else {
      hasMounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export const useDetectElement = (
  func: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: any[]
): void => {
  React.useEffect(() => {
    if (document.getElementById('datagateway-dataview')) {
      func();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useAfterMountEffect;
