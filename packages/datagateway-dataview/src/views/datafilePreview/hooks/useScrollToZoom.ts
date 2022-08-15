import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
} from '../state/actions';

/**
 * A React hook that allows the zoom level of the datafile previewer to be controlled
 * by scrolling on the given HTML element.
 *
 * @param targetElement Mouse scrolling on this element will change the zoom level of the datafile previewer.
 *                      Nothing will happen if null is passed in.
 * @param ctrlRequired Whether the Ctrl key needs to be held down to trigger zoom control.
 *        If set to true, the user will have to hold down the ctrl key while scrolling
 *        to adjust the zoom level of the datafile previewer.
 */
function useScrollToZoom({
  targetElement,
}: {
  targetElement: HTMLElement | null;
}): void {
  const isCtrlKeyDown = useRef(false);
  const dispatch = useDispatch();

  // called when users scroll on the zoom level chip
  const handleScrollingOnChip = React.useCallback(
    (event: WheelEvent) => {
      if (event.deltaY < 0) {
        // scrolling down, zoom out content
        dispatch({ type: IncrementDatafilePreviewerZoomLevelType });
      } else if (event.deltaY > 0) {
        // scrolling up, zoom in content
        dispatch({ type: DecrementDatafilePreviewerZoomLevelType });
      }
    },
    [dispatch]
  );

  const onKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey) {
      isCtrlKeyDown.current = true;
    }
  }, []);

  const onKeyUp = React.useCallback((event: KeyboardEvent) => {
    if (!event.ctrlKey) {
      isCtrlKeyDown.current = false;
    }
  }, []);

  // listen to ctrl key down/up
  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  });

  // listen to mouse wheel events
  React.useEffect(() => {
    // detect scrolling on the zoom level chip
    // let users adjust zoom by scrolling on the chip
    targetElement?.addEventListener('wheel', handleScrollingOnChip);
    return () => {
      targetElement?.removeEventListener('wheel', handleScrollingOnChip);
    };
  }, [dispatch, handleScrollingOnChip, targetElement]);
}

export default useScrollToZoom;
