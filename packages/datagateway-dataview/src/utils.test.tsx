import React from 'react';
import useAfterMountEffect from './utils';
import { mount } from 'enzyme';

const TestHook = (props: {
  callback: () => void;
  triggerProp: number;
  nonTriggerProp?: number;
}): React.ReactElement => {
  props.callback();
  return <div />;
};

describe('Utils', () => {
  describe('useAfterMountEffect', () => {
    const mockFunction = jest.fn();

    afterEach(() => {
      mockFunction.mockClear();
    });

    it('calls effect only upon prop changes, not on mount', () => {
      const wrapper = mount(
        <TestHook
          triggerProp={1}
          callback={() => useAfterMountEffect(mockFunction)}
        />
      );

      expect(mockFunction).not.toHaveBeenCalled();

      wrapper.setProps({ triggerProp: 2 });
      expect(mockFunction).toHaveBeenCalled();
    });

    it('respects dependency array', () => {
      let triggerProp = 1;

      const wrapper = mount(
        <TestHook
          triggerProp={triggerProp}
          nonTriggerProp={1}
          callback={() => useAfterMountEffect(mockFunction, [triggerProp])}
        />
      );

      expect(mockFunction).not.toHaveBeenCalled();

      wrapper.setProps({ nonTriggerProp: 2 });
      expect(mockFunction).not.toHaveBeenCalled();

      triggerProp = 2;
      wrapper.setProps({});
      expect(mockFunction).toHaveBeenCalled();
    });
  });
});
