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

  const investigationUser = [
    {
      id: 1,
      investigation: {
        id: 1,
      },
      role: 'principal_experimenter',
      user: {
        id: 1,
        name: 'JS',
        fullName: 'John Smith',
      },
    },
    {
      id: 2,
      investigation: {
        id: 1,
      },
      role: 'local_contact',
      user: {
        id: 2,
        name: 'JS',
        fullName: 'Jane Smith',
      },
    },
    {
      id: 3,
      investigation: {
        id: 1,
      },
      role: 'experimenter',
      user: {
        id: 3,
        name: 'JS',
        fullName: 'Jesse Smith',
      },
    },
    {
      id: 4,
      investigation: {
        id: 1,
      },
      role: 'experimenter',
      user: {
        id: 4,
        name: 'JS',
        fullName: '',
      },
    },
  ];

  const investigationInstrument = [
    {
      id: 1,
      investigation: {
        id: 1,
      },
      instrument: {
        id: 3,
        name: 'LARMOR',
      },
    },
  ];

  const study = {
    id: 7,
    pid: 'study pid',
    startDate: '2019-06-10',
    endDate: '2019-06-11',
  };

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    rbNumber: '1',
    doi: 'doi 1',
    size: 1,
    investigationInstruments: investigationInstrument,
    startDate: '2019-06-10',
    endDate: '2019-06-11',
  };

  const initialData = [
    {
      id: 6,
      investigation: {
        id: 1,
      },
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
              study: study,
              investigation: {
                ...investigation,
                investigationUsers: [investigationUser[0]],
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
              study: study,
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
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
        data: [{ ...initialData, investigation: { ...investigation } }],
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

  it('displays missing investigation label when investigation is null', () => {
    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [
          {
            study: study,
          },
        ],
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
    ).toEqual('investigations.missing');
  });
});
