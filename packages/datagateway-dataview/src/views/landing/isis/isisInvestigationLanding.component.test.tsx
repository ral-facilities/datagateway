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
      id: 1,
      title: 'Test 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      rbNumber: '1',
      doi: 'doi 1',
      size: 1,
      investigationInstruments: [
        {
          id: 1,
          instrument: {
            id: 3,
            name: 'LARMOR',
          },
          investigation: {
            id: 1,
          },
        },
      ],
      studyInvestigations: [
        {
          id: 6,
          investigation: {
            id: 1,
          },
          study: {
            id: 7,
            pid: 'study pid',
            startDate: '2019-06-10',
            endDate: '2019-06-11',
          },
        },
      ],
      startDate: '2019-06-10',
      endDate: '2019-06-11',
      datasets: [
        {
          id: 1,
          name: 'dataset 1',
          doi: 'dataset doi',
        },
      ],
    },
  ];
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
  const sample = [
    {
      id: 1,
      investigation: {
        id: 1,
      },
      name: 'Sample',
    },
  ];
  const publication = [
    {
      id: 1,
      fullReference: 'Journal, Author, Date, DOI',
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
      { ...initialData[0], investigationUsers: investigationUser },
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

    state.dgcommon.data = [{ ...initialData[0], publications: publication }];
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

    state.dgcommon.data = [{ ...initialData[0], samples: sample }];
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
        data: [{ ...state.dgcommon.data[0], studyInvestigations: undefined }],
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
            investigationUsers: [investigationUser[0]],
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
          { ...state.dgcommon.data[0], investigationUsers: investigationUser },
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

  it('copies data citation to clipboard', () => {
    // Mock the clipboard object
    Object.assign(navigator, {
      clipboard: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        writeText: () => {},
      },
    });

    jest.spyOn(navigator.clipboard, 'writeText');

    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [
          {
            ...state.dgcommon.data[0],
            investigationUsers: [investigationUser[0]],
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

    wrapper
      .find('#landing-investigation-copy-citation')
      .first()
      .simulate('click');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'John Smith; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
    );

    expect(
      wrapper.find('#landing-investigation-copied-citation').first().text()
    ).toEqual('Copied citation');
  });
});
