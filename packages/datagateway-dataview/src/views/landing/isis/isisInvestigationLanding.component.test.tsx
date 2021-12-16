import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISInvestigationLanding from './isisInvestigationLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  useInvestigation,
  useInvestigationSizes,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Router } from 'react-router';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigation: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('ISIS Investigation Landing page', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  const createWrapper = (studyHierarchy = false): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationLanding
              instrumentId="4"
              instrumentChildId="5"
              investigationId="1"
              studyHierarchy={studyHierarchy}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  const initialData = [
    {
      id: 1,
      title: 'Test 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
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
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    history = createMemoryHistory();

    (useInvestigation as jest.Mock).mockReturnValue({
      data: initialData,
    });
    (useInvestigationSizes as jest.Mock).mockReturnValue([
      {
        data: 1,
      },
    ]);
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('calls the correct data fetching hooks', () => {
    createWrapper();

    expect(useInvestigation).toHaveBeenCalledWith(1, [
      {
        filterType: 'include',
        filterValue: JSON.stringify([
          {
            investigationUsers: 'user',
          },
          'samples',
          'publications',
          'datasets',
          {
            studyInvestigations: 'study',
          },
          {
            investigationInstruments: 'instrument',
          },
        ]),
      },
    ]);
    expect(useInvestigationSizes).toHaveBeenCalledWith(initialData);
  });

  it('links to the correct url in the datafiles tab for both hierarchies and both views', () => {
    const facilityCycleWrapper = createWrapper();

    facilityCycleWrapper
      .find('#investigation-datasets-tab')
      .first()
      .simulate('click');

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/5/investigation/1/dataset'
    );

    history.replace('/?view=card');
    const studyWrapper = createWrapper(true);

    studyWrapper.find('#investigation-datasets-tab').first().simulate('click');

    expect(history.location.pathname).toBe(
      '/browseStudyHierarchy/instrument/4/study/5/investigation/1/dataset'
    );
    expect(history.location.search).toBe('?view=card');
  });

  it('users displayed correctly', () => {
    let wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="landing-investigation-users-label"]')
    ).toHaveLength(0);
    expect(
      wrapper.find('[aria-label="landing-investigation-user-0"]')
    ).toHaveLength(0);

    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], investigationUsers: investigationUser }],
    });
    wrapper = createWrapper();

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
    let wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="landing-investigation-publications-label"]')
    ).toHaveLength(0);
    expect(
      wrapper.find('[aria-label="landing-investigation-publication-0"]')
    ).toHaveLength(0);

    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], publications: publication }],
    });
    wrapper = createWrapper();

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
    let wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="landing-investigation-samples-label"]')
    ).toHaveLength(0);
    expect(
      wrapper.find('[aria-label="landing-investigation-sample-0"]')
    ).toHaveLength(0);

    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], samples: sample }],
    });
    wrapper = createWrapper();

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
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], studyInvestigations: undefined }],
    });
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="citation-formatter-citation"]').first().text()
    ).toEqual('Test 1, doi_constants.publisher.name, https://doi.org/doi 1');
  });

  it('displays citation correctly with one user', () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], investigationUsers: [investigationUser[0]] }],
    });
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="citation-formatter-citation"]').first().text()
    ).toEqual(
      'John Smith; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
    );
  });

  it('displays citation correctly with multiple users', () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      data: [{ ...initialData[0], investigationUsers: investigationUser }],
    });
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="citation-formatter-citation"]').first().text()
    ).toEqual(
      'John Smith et al; 2019: Test 1, doi_constants.publisher.name, https://doi.org/doi 1'
    );
  });

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="isis-investigation-landing-doi-link"]')
        .first()
        .text()
    ).toEqual('doi 1');

    expect(
      wrapper
        .find('[data-testid="isis-investigation-landing-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/doi 1');
  });

  it('displays Experiment DOI (PID) and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="isis-investigations-landing-parent-doi-link"]')
        .first()
        .text()
    ).toEqual('study pid');

    expect(
      wrapper
        .find('[data-testid="isis-investigations-landing-parent-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/study pid');
  });
});
