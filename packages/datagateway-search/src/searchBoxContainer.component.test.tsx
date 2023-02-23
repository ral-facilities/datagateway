import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';

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
  const createWrapper = (): ShallowWrapper => {
    return shallow(
      <SearchBoxContainer
        initiateSearch={jest.fn()}
        onSearchTextChange={jest.fn()}
        searchText=""
      />
    );
  };

  beforeEach(() => {
    useSelector.mockImplementation(() => {
      return initialState;
    });
  });

  it('renders searchBoxContainer correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  const createWrapper = (): ShallowWrapper => {
    return shallow(
      <SearchBoxContainerSide
        initiateSearch={jest.fn()}
        onSearchTextChange={jest.fn()}
        searchText=""
      />
    );
  };

  it('renders searchBoxContainerSide correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });
});
