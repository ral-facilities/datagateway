import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { mount } from 'enzyme';
import * as log from 'loglevel';
import { act } from 'react-dom/test-utils';
import StylesProvider from '@mui/styles/StylesProvider';
import { flushPromises } from './setupTests';

jest.mock('loglevel');
jest.mock('./ConfigProvider');

describe('App', () => {
  it('renders without crashing', async () => {
    const div = document.createElement('div');

    ReactDOM.render(<App />, div);

    await act(async () => {
      await flushPromises();
    });

    ReactDOM.unmountComponentAtNode(div);
  });

  it('catches errors using componentDidCatch and shows fallback UI', async () => {
    const wrapper = mount(<App />);
    const error = new Error('test');

    await act(async () => {
      await flushPromises();
    });

    wrapper.find(StylesProvider).simulateError(error);

    expect(wrapper.exists('.error')).toBe(true);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;

    expect(mockLog.calls[0][0]).toEqual(
      `datagateway-download failed with error: ${error}`
    );
  });
});
