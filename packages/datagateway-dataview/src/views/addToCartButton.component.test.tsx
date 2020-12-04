import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import AddToCartButton from './addToCartButton.component';
import configureStore from 'redux-mock-store';
import {
  addToCartRequest,
  dGCommonInitialState,
  removeFromCartRequest,
} from 'datagateway-common';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('Generic add to cart button', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    /*
    state.dgcommon.data = [
      {
        ID: 1,
        TITLE: 'Test 1',
        NAME: 'Test 1',
        SUMMARY: 'foo bar',
        VISIT_ID: '1',
        RB_NUMBER: '1',
        DOI: 'doi 1',
        SIZE: 1,
        INVESTIGATIONINSTRUMENT: [
          {
            ID: 1,
            INVESTIGATION_ID: 1,
            INSTRUMENT_ID: 3,
            INSTRUMENT: {
              ID: 3,
              NAME: 'LARMOR',
              FACILITY_ID: 1,
            },
          },
        ],
        STUDYINVESTIGATION: [
          {
            ID: 6,
            STUDY_ID: 7,
            INVESTIGATION_ID: 1,
            STUDY: {
              ID: 7,
              PID: 'study pid',
            },
          },
        ],
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-11',
      },
    ];
    state.dgcommon.allIds = [1];
    */
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <AddToCartButton
        store={mockStore(state)}
        allIds={[1]}
        entityId={1}
        entityType="investigation"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends addToCart action on button press', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <AddToCartButton
            allIds={[1]}
            entityId={1}
            entityType="investigation"
          />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('#add-to-cart-btn').first().simulate('click');
    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(addToCartRequest());
  });

  it('sends removeFromCart action on button press', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <AddToCartButton
            allIds={[1]}
            entityId={1}
            entityType="investigation"
          />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('#remove-from-cart-btn').first().simulate('click');
    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(removeFromCartRequest());
  });
});
