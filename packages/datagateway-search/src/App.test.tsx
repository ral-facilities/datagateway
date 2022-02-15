import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { mount } from 'enzyme';
import * as log from 'loglevel';
import { Provider } from 'react-redux';

jest.mock('loglevel');

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('catches errors using componentDidCatch and shows fallback UI', () => {
    const wrapper = mount(<App />);
    const error = new Error('test');
    wrapper.find(Provider).simulateError(error);

    expect(wrapper.exists('.error')).toBe(true);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls).toContainEqual([
      `datagateway_search failed with error: ${error}`,
    ]);
  });
});
