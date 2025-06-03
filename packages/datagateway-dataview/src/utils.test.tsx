import useAfterMountEffect from './utils';
import { renderHook } from '@testing-library/react';

describe('Utils', () => {
  describe('useAfterMountEffect', () => {
    const mockFunction = vi.fn();

    afterEach(() => {
      mockFunction.mockClear();
    });

    it('calls effect only upon prop changes, not on mount', () => {
      const callback = vi.fn();

      const { rerender } = renderHook(() => useAfterMountEffect(callback));

      expect(callback).not.toHaveBeenCalled();

      rerender();
      expect(callback).toHaveBeenCalled();
    });

    it('respects dependency array', () => {
      const callback = vi.fn();

      const { rerender } = renderHook(
        (testProp) => useAfterMountEffect(callback, [testProp]),
        {
          initialProps: 1,
        }
      );

      expect(callback).not.toHaveBeenCalled();

      rerender(1);
      expect(callback).not.toHaveBeenCalled();

      rerender(2);
      expect(callback).toHaveBeenCalled();
    });
  });
});
