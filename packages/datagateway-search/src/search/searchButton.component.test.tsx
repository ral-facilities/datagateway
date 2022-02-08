import React from 'react';
import { createShallow, createMount } from '@mui/material/test-utils';
import SearchButton from './searchButton.component';
import Button from '@mui/material/Button';

jest.mock('loglevel');

describe('Search Button component tests', () => {
  let shallow;
  let mount;

  const testInitiateSearch = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    testInitiateSearch.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <div>
        <SearchButton initiateSearch={testInitiateSearch} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('initiates search when user clicks button', () => {
    const wrapper = mount(<SearchButton initiateSearch={testInitiateSearch} />);
    wrapper.find(Button).simulate('click');
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
