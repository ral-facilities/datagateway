import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import { createShallow } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import SearchBoxContainer from './searchBoxContainer.component';

jest.mock('loglevel');

describe('SearchBoxContainer - Tests', () => {
  let shallow;
  let state: StateType;

  const createWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return shallow(
      <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
        <SearchBoxContainer store={mockStore(state)} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );
  });

  it('renders searchBoxContainer correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper).toMatchSnapshot();
  });
});
