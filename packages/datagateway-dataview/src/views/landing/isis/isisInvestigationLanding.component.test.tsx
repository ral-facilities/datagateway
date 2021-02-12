import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISInvestigationLanding from './isisInvestigationLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
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
            STARTDATE: '2019-06-10',
            ENDDATE: '2019-06-11',
          },
        },
      ],
      STARTDATE: '2019-06-10',
      ENDDATE: '2019-06-11',
      DATASET: [
        {
          ID: 1,
          NAME: 'dataset 1',
          DOI: 'dataset doi',
        },
      ],
    },
  ];
  const investigationUser = [
    {
      ID: 1,
      USER_ID: 1,
      INVESTIGATION_ID: 1,
      ROLE: 'principal_experimenter',
      USER_: {
        ID: 1,
        NAME: 'JS',
        FULLNAME: 'John Smith',
      },
    },
    {
      ID: 2,
      USER_ID: 2,
      INVESTIGATION_ID: 1,
      ROLE: 'local_contact',
      USER_: {
        ID: 2,
        NAME: 'JS',
        FULLNAME: 'Jane Smith',
      },
    },
    {
      ID: 3,
      USER_ID: 3,
      INVESTIGATION_ID: 1,
      ROLE: 'experimenter',
      USER_: {
        ID: 3,
        NAME: 'JS',
        FULLNAME: 'Jesse Smith',
      },
    },
    {
      ID: 4,
      USER_ID: 4,
      INVESTIGATION_ID: 4,
      ROLE: 'experimenter',
      USER_: {
        ID: 4,
        NAME: 'JS',
        FULLNAME: '',
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

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <ISISInvestigationLanding
        store={mockStore(state)}
        instrumentId="4"
        instrumentChildId="5"
        investigationId="1"
        studyHierarchy={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for studyHierarchy', () => {
    const wrapper = shallow(
      <ISISInvestigationLanding
        store={mockStore(state)}
        instrumentId="4"
        instrumentChildId="5"
        investigationId="1"
        studyHierarchy={true}
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
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));

    wrapper.find('#investigation-datasets-tab').first().simulate('click');

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()[1]).toEqual(
      push('/browse/instrument/4/facilityCycle/5/investigation/1/dataset')
    );
  });

  it('actions dispatched correctly in cardView', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        query: { ...state.dgcommon.query, view: 'card' },
      },
    });
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));

    wrapper.find('#investigation-datasets-tab').first().simulate('click');

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()[1]).toEqual(
      push(
        '/browse/instrument/4/facilityCycle/5/investigation/1/dataset?view=card'
      )
    );
  });

  it('users displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
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
    ).toEqual('Principal Investigator: John Smith');
    expect(
      wrapper.find('[aria-label="landing-investigation-user-1"]').first().text()
    ).toEqual('Local Contact: Jane Smith');
    expect(
      wrapper.find('[aria-label="landing-investigation-user-2"]').first().text()
    ).toEqual('Experimenter: Jesse Smith');
    expect(
      wrapper.find('[aria-label="landing-investigation-user-3"]')
    ).toHaveLength(0);
  });

  it('publications displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
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

  it('samples displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-investigation-samples-label"]')
    ).toHaveLength(0);
    expect(
      wrapper.find('[aria-label="landing-investigation-sample-0"]')
    ).toHaveLength(0);

    state.dgcommon.data = [{ ...initialData[0], SAMPLE: sample }];
    wrapper.setProps({ store: mockStore(state) });

    expect(
      wrapper.find('[aria-label="landing-investigation-samples-label"]')
    ).toHaveLength(3);
    expect(
      wrapper
        .find('[aria-label="landing-investigation-sample-0"]')
        .first()
        .text()
    ).toEqual('Sample');
  });

  it('displays citation correctly when study missing', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [{ ...state.dgcommon.data[0], STUDYINVESTIGATION: undefined }],
      },
    });
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find('[aria-label="landing-investigation-citation"]')
        .first()
        .text()
    ).toEqual('Test 1, doi_constants.publisher.name, https://doi.org/doi 1');
  });

  it('displays citation correctly with one user', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [
          {
            ...state.dgcommon.data[0],
            INVESTIGATIONUSER: [investigationUser[0]],
          },
        ],
      },
    });
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find('[aria-label="landing-investigation-citation"]')
        .first()
        .text()
    ).toEqual(
      'John Smith; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
    );
  });

  it('displays citation correctly with multiple users', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [
          { ...state.dgcommon.data[0], INVESTIGATIONUSER: investigationUser },
        ],
      },
    });
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationLanding
            instrumentId="4"
            instrumentChildId="5"
            investigationId="1"
            studyHierarchy={false}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find('[aria-label="landing-investigation-citation"]')
        .first()
        .text()
    ).toEqual(
      'John Smith et al; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
    );
  });
});
