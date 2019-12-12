import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createMount } from '@material-ui/core/test-utils';
import { mount as enzymeMount } from 'enzyme';

jest.mock('loglevel');

describe('App', () => {
  let mount: typeof enzymeMount;

  beforeAll(() => {
    mount = createMount();
  });

  afterAll(() => {
    mount.cleanUp();
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
