import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';
import PageLanding from './pageLanding.component';

jest.mock('loglevel');
jest.mock('./idCheckFunctions');

// The ISIS routes to test.
const ISISRoutes = {
  investigation: '/browse/instrument/1/facilityCycle/1/investigation/1',
};

describe('PageLanding', () => {
  let mount;
  let state: StateType;

  const createWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <PageLanding />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
  });

  it('renders ISISInvestigationLanding for ISIS investigation route', () => {
    const wrapper = createWrapper(ISISRoutes['investigation']);

    // Expect the ISISInvestigationsLanding component to be present.
    expect(wrapper.exists(ISISInvestigationLanding)).toBe(true);
  });
});
