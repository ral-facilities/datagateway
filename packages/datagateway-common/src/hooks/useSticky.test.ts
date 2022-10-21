import { renderHook } from '@testing-library/react-hooks';
import useSticky from './useSticky';
import { fireEvent } from '@testing-library/react';

describe('useSticky', () => {
  it('returns isSticky true if the bottom of the target element is scrolled past', () => {
    const mockGetBoundingClientRect = jest.fn();
    const target = document.createElement('div');
    target.getBoundingClientRect = mockGetBoundingClientRect;

    // if window scrollY is greater than boundingClientRect bottom
    // that means the element is scrolled out of view
    global.scrollY = 100;
    mockGetBoundingClientRect.mockReturnValue({
      bottom: 50,
    });

    const { waitFor, result } = renderHook(() =>
      useSticky({ current: target })
    );

    // scroll the window
    fireEvent.scroll(window, {});

    waitFor(() => {
      expect(result.current.isSticky).toBe(true);
    });
  });

  it('returns isSticky false if the bottom of the target element is still in view', () => {
    const mockGetBoundingClientRect = jest.fn();
    const target = document.createElement('div');
    target.getBoundingClientRect = mockGetBoundingClientRect;

    // if window scrollY is greater than boundingClientRect bottom
    // that means the element is scrolled out of view
    global.scrollY = 100;
    mockGetBoundingClientRect.mockReturnValue({
      bottom: 150,
    });

    const { waitFor, result } = renderHook(() =>
      useSticky({ current: target })
    );

    // scroll the window
    fireEvent.scroll(window, {});

    waitFor(() => {
      expect(result.current.isSticky).toBe(false);
    });
  });

  it('returns isSticky false upon window scroll if the given react ref points to null', () => {
    const { waitFor, result } = renderHook(() => useSticky({ current: null }));
    // scroll the window
    fireEvent.scroll(window, {});
    waitFor(() => {
      expect(result.current.isSticky).toBe(false);
    });
  });

  it('returns isStick false upon window scroll if bottom coordinate of the target element is unavailable', () => {
    const mockGetBoundingClientRect = jest.fn();
    const target = document.createElement('div');
    target.getBoundingClientRect = mockGetBoundingClientRect;

    // if window scrollY is greater than boundingClientRect bottom
    // that means the element is scrolled out of view
    global.scrollY = 100;
    mockGetBoundingClientRect.mockReturnValue({
      top: 150,
    });

    const { waitFor, result } = renderHook(() =>
      useSticky({ current: target })
    );

    // scroll the window
    fireEvent.scroll(window, {});

    waitFor(() => {
      expect(result.current.isSticky).toBe(false);
    });
  });
});
