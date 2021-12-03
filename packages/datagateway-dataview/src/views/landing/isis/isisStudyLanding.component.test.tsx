import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISStudyLanding from './isisStudyLanding.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import { dGCommonInitialState, useStudy } from 'datagateway-common';
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
    useStudy: jest.fn(),
  };
});

describe('ISIS Study Landing page', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudyLanding instrumentId="4" studyId="5" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

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

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    doi: 'doi 1',
    size: 1,
    investigationInstruments: investigationInstrument,
    startDate: '2019-06-10',
    endDate: '2019-06-11',
  };

  const initialData = [
    {
      id: 7,
      pid: 'study pid',
      startDate: '2019-06-10',
      endDate: '2019-06-11',
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

    (useStudy as jest.Mock).mockReturnValue({
      data: initialData,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('calls the correct data fetching hooks', () => {
    createWrapper();

    expect(useStudy).toHaveBeenCalledWith(5);
  });

  it('links to the correct url in the datafiles tab for both hierarchies and both views', () => {
    let wrapper = createWrapper();

    wrapper.find('#study-investigations-tab').first().simulate('click');

    expect(history.location.pathname).toBe(
      '/browseStudyHierarchy/instrument/4/study/5/investigation'
    );

    history.replace('/?view=card');
    wrapper = createWrapper();

    wrapper.find('#study-investigations-tab').first().simulate('click');

    expect(history.location.pathname).toBe(
      '/browseStudyHierarchy/instrument/4/study/5/investigation'
    );
    expect(history.location.search).toBe('?view=card');
  });

  it('single user displayed correctly', () => {
    let wrapper = createWrapper();

    expect(
      wrapper.find('[data-testid="landing-study-users-label"]')
    ).toHaveLength(0);
    expect(wrapper.find('[data-testid="landing-study-user-0"]')).toHaveLength(
      0
    );

    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: [investigationUser[0]],
              },
            },
          ],
        },
      ],
    });
    wrapper = createWrapper();

    expect(
      wrapper.find('[data-testid="landing-study-users-label"]')
    ).toHaveLength(3);
    expect(
      wrapper.find('[data-testid="landing-study-user-0"]').first().text()
    ).toEqual('Principal Investigator: John Smith');

    expect(
      wrapper.find('[data-testid="landing-study-citation"]').first().text()
    ).toEqual(
      'John Smith; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
    );
  });

  it('multiple users displayed correctly', () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    const wrapper = createWrapper();

    expect(
      wrapper.find('[data-testid="landing-study-users-label"]')
    ).toHaveLength(3);
    expect(
      wrapper.find('[data-testid="landing-study-user-0"]').first().text()
    ).toEqual('Principal Investigator: John Smith');
    expect(
      wrapper.find('[data-testid="landing-study-user-1"]').first().text()
    ).toEqual('Local Contact: Jane Smith');
    expect(
      wrapper.find('[data-testid="landing-study-user-2"]').first().text()
    ).toEqual('Experimenter: Jesse Smith');
    expect(
      wrapper.find('[data-testid="landing-investigation-user-3"]')
    ).toHaveLength(0);

    expect(
      wrapper.find('[data-testid="landing-study-citation"]').first().text()
    ).toEqual(
      'John Smith et al; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
    );
  });

  it('displays DOI and renders the expected link', () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="landing-study-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/doi 1');

    expect(
      wrapper.find('[data-testid="landing-study-doi-link"]').first().text()
    ).toEqual('doi 1');
  });

  it('displays Experiment DOI (PID) and renders the expected link', () => {
    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="landing-study-pid-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/study pid');

    expect(
      wrapper.find('[data-testid="landing-study-pid-link"]').first().text()
    ).toEqual('study pid');
  });

  it('copies data citation to clipboard', () => {
    // Mock the clipboard object
    const testWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: testWriteText,
      },
    });

    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: [investigationUser[0]],
              },
            },
          ],
        },
      ],
    });
    const wrapper = createWrapper();

    expect(
      wrapper.find('[data-testid="landing-study-citation"]').first().text()
    ).toEqual(
      'John Smith; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
    );

    wrapper.find('#landing-study-copy-citation').first().simulate('click');

    expect(testWriteText).toHaveBeenCalledWith(
      'John Smith; 2019: Title 1, doi_constants.publisher.name, https://doi.org/study pid'
    );

    expect(
      wrapper.find('#landing-study-copied-citation').first().text()
    ).toEqual('studies.details.copied_citation');
  });

  it('renders structured data correctly', () => {
    // mock getElementByTagNameSpy so we can snapshot mockElement
    const docFragment = document.createDocumentFragment();
    const mockElement = document.createElement('head');
    docFragment.appendChild(mockElement);
    const mockHTMLCollection = docFragment.children;
    jest
      .spyOn(document, 'getElementsByTagName')
      .mockReturnValue(mockHTMLCollection);

    (useStudy as jest.Mock).mockReturnValue({
      data: [
        {
          ...initialData[0],
          studyInvestigations: [
            {
              investigation: {
                ...investigation,
                investigationUsers: investigationUser,
              },
            },
          ],
        },
      ],
    });
    createWrapper();

    expect(mockElement.innerHTML).toMatchSnapshot();
  });
});
