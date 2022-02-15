import React from 'react';
import { ReactWrapper, shallow } from 'enzyme';

import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';
import { useSelector } from 'react-redux';
import { initialState } from './state/reducers/dgsearch.reducer';

jest.mock('loglevel');

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('SearchBoxContainer - Tests', () => {
  const testInitiateSearch = jest.fn();

  const createWrapper = (path: string): ReactWrapper => {
    return shallow(<SearchBoxContainer initiateSearch={testInitiateSearch} />);
  };

  beforeEach(() => {
    useSelector.mockImplementation(() => {
      return initialState;
    });
  });

  it('renders searchBoxContainer correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper).toMatchSnapshot();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  const testInitiateSearch = jest.fn();

  const createWrapper = (path: string): ReactWrapper => {
    return shallow(
      <SearchBoxContainerSide initiateSearch={testInitiateSearch} />
    );
  };

  it('renders searchBoxContainerSide correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper).toMatchSnapshot();
  });
});
