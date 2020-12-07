import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISInvestigationLanding from './isisInvestigationLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  fetchInvestigationDetailsRequest,
  fetchInvestigationsRequest,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { push } from 'connected-react-router';

describe('ISIS Investigation Landing page', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  const initialData = [
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
  const investigationUser = [
    {
      ID: 1,
      USER_ID: 1,
      INVESTIGATION_ID: 1,
      ROLE: 'Lead Investigator',
      USER_: {
        ID: 1,
        NAME: 'JS',
        FULLNAME: 'John Smith',
      },
    },
  ];
  const sample = [
    {
      ID: 1,
      NAME: 'Sample',
      INVESTIGATION_ID: 1,
    },
  ];
  const publication = [
    {
      ID: 1,
      FULLREFERENCE: 'Journal, Author, Date, DOI',
    },
  ];

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
    state.dgcommon.data = initialData;
    state.dgcommon.allIds = [1];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <ISISInvestigationLanding
        store={mockStore(state)}
        instrumentId="4"
        facilityCycleId="5"
        investigationId="1"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('actions dispatched correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            facilityCycleId="5"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
    expect(testStore.getActions()[1]).toEqual(
      fetchInvestigationDetailsRequest()
    );

    wrapper.find('#investigation-datasets-tab').first().simulate('click');

    expect(testStore.getActions()).toHaveLength(3);
    expect(testStore.getActions()[2]).toEqual(
      push('/browse/instrument/4/facilityCycle/5/investigation/1/dataset')
    );
  });

  it('fetchDetails not dispatched if no data in state', () => {
    state.dgcommon.data = [];
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            facilityCycleId="5"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('fetchDetails not dispatched if details already present', () => {
    state.dgcommon.data = [
      {
        ...initialData[0],
        INVESTIGATIONUSER: investigationUser,
        PUBLICATION: publication,
        SAMPLE: sample,
      },
    ];
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            facilityCycleId="5"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('users displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            facilityCycleId="5"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-investigation-users-label"]')
    ).toHaveLength(0);
    expect(
      wrapper.find('[aria-label="landing-investigation-user-0"]')
    ).toHaveLength(0);

    state.dgcommon.data = [
      { ...initialData[0], INVESTIGATIONUSER: investigationUser },
    ];
    wrapper.setProps({ store: mockStore(state) });

    expect(
      wrapper.find('[aria-label="landing-investigation-users-label"]')
    ).toHaveLength(3);
    expect(
      wrapper.find('[aria-label="landing-investigation-user-0"]').first().text()
    ).toEqual('Lead Investigator: John Smith');
  });

  it('publications displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            facilityCycleId="5"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-investigation-publications-label"]')
    ).toHaveLength(0);
    expect(
      wrapper.find('[aria-label="landing-investigation-publication-0"]')
    ).toHaveLength(0);

    state.dgcommon.data = [{ ...initialData[0], PUBLICATION: publication }];
    wrapper.setProps({ store: mockStore(state) });

    expect(
      wrapper.find('[aria-label="landing-investigation-publications-label"]')
    ).toHaveLength(3);
    expect(
      wrapper
        .find('[aria-label="landing-investigation-reference-0"]')
        .first()
        .text()
    ).toEqual('Journal, Author, Date, DOI');
  });
});
