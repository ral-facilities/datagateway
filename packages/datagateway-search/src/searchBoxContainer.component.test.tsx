import React from 'react';
import { ReactWrapper } from 'enzyme';

import { createShallow } from '@material-ui/core/test-utils';
import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';

jest.mock('loglevel');

describe('SearchBoxContainer - Tests', () => {
  let shallow;

  const testInitiateSearch = jest.fn();

  const createWrapper = (path: string): ReactWrapper => {
    return shallow(<SearchBoxContainer initiateSearch={testInitiateSearch} />);
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });
  });

  it('renders searchBoxContainer correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper).toMatchSnapshot();
  });
});

describe('SearchBoxContainerSide - Tests', () => {
  let shallow;

  const testInitiateSearch = jest.fn();

  const createWrapper = (path: string): ReactWrapper => {
    return shallow(
      <SearchBoxContainerSide initiateSearch={testInitiateSearch} />
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });
  });

  it('renders searchBoxContainerSide correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper).toMatchSnapshot();
  });
});
