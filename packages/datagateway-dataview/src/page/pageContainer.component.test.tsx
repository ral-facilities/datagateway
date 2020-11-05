import React from 'react';
import { ReactWrapper, mount } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import { createShallow } from '@material-ui/core/test-utils';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router';
import { push } from 'connected-react-router';

import PageContainer from './pageContainer.component';

jest.mock('loglevel');

describe('PageContainer - Tests', () => {
  let shallow;
  let state: StateType;
  document.getElementById = jest.fn();

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return shallow(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={mockStore(state)} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });

    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState, totalDataCount: 101 },
        dgdataview: dgDataViewInitialState,

        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );
  });

  afterEach(() => {
    document.getElementById.mockReset();
  });

  it('displays the correct entity count', () => {
    // Set up store with the test state and mounted page head.
    const wrapper = createWrapper(state);

    expect(wrapper).toMatchSnapshot();
  });

  it('does not fetch cart on load if no dg-dataview element exists', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()).not.toContain({
      type: 'datagateway_common:fetch_download_cart_request',
    });
  });

  it('opens search plugin when icon clicked', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    wrapper
      .find('[aria-label="container-table-search"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(3);
    expect(testStore.getActions()[2]).toEqual(push('/search/data'));
  });

  it('opens download plugin when Download Cart clicked', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    wrapper
      .find('[aria-label="container-table-cart"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(3);
    expect(testStore.getActions()[2]).toEqual(push('/download'));
  });
});
