import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISStudyLanding from './isisStudyLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import { dGCommonInitialState, fetchStudiesRequest } from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { push } from 'connected-react-router';

describe('ISIS Study Landing page', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

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

  const investigationInstrument = [
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
  ];

  const study = {
    ID: 7,
    PID: 'study pid',
    STARTDATE: '2019-06-10',
    ENDDATE: '2019-06-11',
  };

  const investigation = {
    ID: 1,
    TITLE: 'Title 1',
    NAME: 'Name 1',
    SUMMARY: 'foo bar',
    VISIT_ID: '1',
    RB_NUMBER: '1',
    DOI: 'doi 1',
    SIZE: 1,
    INVESTIGATIONINSTRUMENT: investigationInstrument,
    STARTDATE: '2019-06-10',
    ENDDATE: '2019-06-11',
  };

  const initialData = [
    {
      ID: 6,
      STUDY_ID: 7,
      INVESTIGATION_ID: 1,
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
      <ISISStudyLanding store={mockStore(state)} instrumentId="4" studyId="5" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('actions dispatched correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudyLanding instrumentId="4" studyId="5" />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchStudiesRequest(1));

    wrapper.find('#study-investigations-tab').first().simulate('click');

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()[1]).toEqual(
      push('/browseStudyHierarchy/instrument/4/study/5/investigation')
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
          <ISISStudyLanding instrumentId="4" studyId="5" />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(fetchStudiesRequest(1));

    wrapper.find('#study-investigations-tab').first().simulate('click');

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()[1]).toEqual(
      push('/browseStudyHierarchy/instrument/4/study/5/investigation?view=card')
    );
  });

  it('single user displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudyLanding instrumentId="4" studyId="5" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-study-users-label"]')
    ).toHaveLength(0);
    expect(wrapper.find('[aria-label="landing-study-user-0"]')).toHaveLength(0);

    wrapper.setProps({
      store: mockStore({
        ...state,
        dgcommon: {
          ...state.dgcommon,
          data: [
            {
              ...initialData,
              STUDY: study,
              INVESTIGATION: {
                ...investigation,
                INVESTIGATIONUSER: [investigationUser[0]],
              },
            },
          ],
        },
      }),
    });

    expect(
      wrapper.find('[aria-label="landing-study-users-label"]')
    ).toHaveLength(3);
    expect(
      wrapper.find('[aria-label="landing-study-user-0"]').first().text()
    ).toEqual('Principal Investigator: John Smith');

    expect(
      wrapper.find('[aria-label="landing-study-citation"]').first().text()
    ).toEqual(
      'John Smith; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
    );
  });

  it('multiple users displayed correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudyLanding instrumentId="4" studyId="5" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-study-users-label"]')
    ).toHaveLength(0);
    expect(wrapper.find('[aria-label="landing-study-user-0"]')).toHaveLength(0);

    wrapper.setProps({
      store: mockStore({
        ...state,
        dgcommon: {
          ...state.dgcommon,
          data: [
            {
              ...initialData,
              STUDY: study,
              INVESTIGATION: {
                ...investigation,
                INVESTIGATIONUSER: investigationUser,
              },
            },
          ],
        },
      }),
    });

    expect(
      wrapper.find('[aria-label="landing-study-users-label"]')
    ).toHaveLength(3);
    expect(
      wrapper.find('[aria-label="landing-study-user-0"]').first().text()
    ).toEqual('Principal Investigator: John Smith');
    expect(
      wrapper.find('[aria-label="landing-study-user-1"]').first().text()
    ).toEqual('Local Contact: Jane Smith');
    expect(
      wrapper.find('[aria-label="landing-study-user-2"]').first().text()
    ).toEqual('Experimenter: Jesse Smith');
    expect(
      wrapper.find('[aria-label="landing-investigation-user-3"]')
    ).toHaveLength(0);

    expect(
      wrapper.find('[aria-label="landing-study-citation"]').first().text()
    ).toEqual(
      'John Smith et al; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
    );
  });

  it('displays correctly when study missing', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [{ ...initialData, INVESTIGATION: { ...investigation } }],
      },
    });
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudyLanding instrumentId="4" studyId="5" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-study-citation"]').first().text()
    ).toEqual('Title 1, doi_constants.publisher.name');
  });

  it('displays correctly when investigation missing', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [{ ...initialData, STUDY: { ...study } }],
      },
    });
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudyLanding instrumentId="4" studyId="5" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-label="landing-study-part-label"]').first().text()
    ).toEqual('investigations.visit_id: undefined');

    expect(
      wrapper.find('[aria-label="landing-study-citation"]').first().text()
    ).toEqual('2019: doi_constants.publisher.name, https://doi.org/study pid');
  });
});
