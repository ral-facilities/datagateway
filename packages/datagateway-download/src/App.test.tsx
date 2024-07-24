import { render } from '@testing-library/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import App, { ErrorFallback } from './App';
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
});

describe('ErrorFallback', () => {
  it('should should render an error message for when app fails catastrophically', () => {
    const { asFragment } = render(<ErrorFallback />);
    expect(asFragment()).toMatchSnapshot();
  });
});
