import { fireEvent, renderHook, waitFor } from '@testing-library/react';
import { Mock } from 'vitest';
import useSticky from './useSticky';

// Mock lodash.debounce to return the function we want to call without delay
vi.mock('lodash.debounce', () => ({
  default: (fn: (args: unknown) => unknown) => fn,
}));

describe('useSticky', () => {
  let mockGetBoundingClientRect: Mock<() => DOMRect>;
  let target: HTMLDivElement;
  const initScrollY = global.scrollY;

  beforeEach(() => {
    mockGetBoundingClientRect = vi.fn(() => new DOMRect(0, 0, 0, 100));
    target = document.createElement('div');
    target.getBoundingClientRect = mockGetBoundingClientRect;

    global.scrollY = 100;
  });

  afterEach(() => {
    global.scrollY = initScrollY;
  });

  it('returns isSticky true if the bottom of the target element is scrolled past', async () => {
    // if window scrollY is greater than boundingClientRect bottom
    // that means the element is scrolled out of view
    mockGetBoundingClientRect.mockReturnValue(new DOMRect(0, 0, 0, 50));

    const { result } = renderHook(() => useSticky({ current: target }));

    // scroll the window
    fireEvent.scroll(window, {});

    await waitFor(() => {
      expect(result.current.isSticky).toBe(true);
    });
  });

  it('returns isSticky false if the bottom of the target element is still in view', async () => {
    // if window scrollY is greater than boundingClientRect bottom
    // that means the element is scrolled out of view
    mockGetBoundingClientRect.mockReturnValue(new DOMRect(0, 0, 0, 150));

    const { result } = renderHook(() => useSticky({ current: target }));

    // scroll the window
    fireEvent.scroll(window, {});

    await waitFor(() => {
      expect(result.current.isSticky).toBe(false);
    });
  });

  it('returns isSticky false upon window scroll if the given react ref points to null', async () => {
    const { result } = renderHook(() => useSticky({ current: null }));
    // scroll the window
    fireEvent.scroll(window, {});
    await waitFor(() => {
      expect(result.current.isSticky).toBe(false);
    });
  });

  it('returns isStick false upon window scroll if bottom coordinate of the target element is unavailable', async () => {
    // if window scrollY is greater than boundingClientRect bottom
    // that means the element is scrolled out of view
    // @ts-expect-error purposefully providing an invalid value
    mockGetBoundingClientRect.mockReturnValue({
      top: 150,
    });

    const { result } = renderHook(() => useSticky({ current: target }));

    // scroll the window
    fireEvent.scroll(window, {});

    await waitFor(() => {
      expect(result.current.isSticky).toBe(false);
    });
  });
});
