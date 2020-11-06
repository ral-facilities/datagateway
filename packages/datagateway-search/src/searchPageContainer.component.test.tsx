import React from 'react';
import { ReactWrapper } from 'enzyme';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import { createShallow } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import SearchPageContainer from './searchPageContainer.component';
import { LinearProgress } from '@material-ui/core';

jest.mock('loglevel');

describe('SearchPageContainer - Tests', () => {
  let shallow;
  let state: StateType;

  const createWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return shallow(
      <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
        <SearchPageContainer store={mockStore(state)} />
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

  it('renders searchPageContainer correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly at /search/data route', () => {
    const wrapper = createWrapper('/search/data');

    expect(wrapper).toMatchSnapshot();
  });

  it('do not display loading bar loading false', () => {
    const wrapper = createWrapper('/search/data');

    expect(wrapper.exists(LinearProgress)).toBeFalsy();
  });

  it('display loading bar when loading true', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState, loading: true },
        dgsearch: dgSearchInitialState,

        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );

    const wrapper = createWrapper('/search/data');

    expect(wrapper.exists(LinearProgress)).toBeTruthy();
  });
});
