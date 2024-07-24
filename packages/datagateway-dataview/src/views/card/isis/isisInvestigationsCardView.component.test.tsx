import { dGCommonInitialState, type Investigation } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { generatePath, Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISInvestigationsCardView from './isisInvestigationsCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
} from '../../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import axios, { type AxiosResponse } from 'axios';
import { paths } from '../../../page/pageContainer.component';

describe('ISIS Investigations - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: Investigation[];
  let history: History;
  let replaceSpy: jest.SpyInstance;
  let user: UserEvent;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider
            client={
              new QueryClient({
                defaultOptions: { queries: { retry: false } },
              })
            }
          >
            <ISISInvestigationsCardView instrumentId="1" facilityCycleId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        title: 'Test title 1',
        name: 'Test 1',
        fileSize: 123,
        fileCount: 1,
        visitId: '1',
        startDate: '2022-01-01',
        endDate: '2022-01-03',
        dataCollectionInvestigations: [
          {
            id: 1,
            dataCollection: {
              id: 14,
              dataPublications: [
                {
                  id: 15,
                  pid: 'Investigation.Data.Publication.Pid',
                  description: 'Investigation Data Publication description',
                  title: 'Investigation Data Publication',
                  type: {
                    id: 16,
                    name: 'investigation',
                  },
                },
              ],
            },
          },
          {
            id: 1,
            dataCollection: {
              id: 11,
              dataPublications: [
                {
                  id: 12,
                  pid: 'Data.Publication.Pid',
                  description: 'Data Publication description',
                  title: 'Data Publication',
                  type: {
                    id: 13,
                    name: 'study',
                  },
                },
              ],
            },
          },
        ],
        investigationUsers: [
          {
            id: 2,
            role: 'experimenter',
            user: { id: 2, name: 'test', fullName: 'Test experimenter' },
          },
          {
            id: 3,
            role: 'principal_experimenter',
            user: { id: 3, name: 'testpi', fullName: 'Test PI' },
          },
        ],
      },
    ];
    history = createMemoryHistory({
      initialEntries: [
        generatePath(paths.toggle.isisInvestigation, {
          instrumentId: '1',
          facilityCycleId: '1',
        }),
      ],
    });
    replaceSpy = jest.spyOn(history, 'replace');
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations\/count$/.test(url)) {
          // investigation count query
          return Promise.resolve({
            data: 1,
          });
        }

        if (/\/investigations$/.test(url)) {
          // investigations query
          return Promise.resolve({
            data: cardData,
          });
        }

        if (/\/user\/getSize$/.test(url)) {
          // investigation size query
          return Promise.resolve({
            data: 123,
          });
        }

        return Promise.reject({
          response: { status: 403 },
          message: `Endpoint not mocked: ${url}`,
        });
      });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders investigations as cards', async () => {
    renderComponent();

    const allCards = await screen.findAllByTestId('card');
    expect(allCards).toHaveLength(1);

    const firstCard = within(allCards[0]);
    expect(
      firstCard.getByRole('link', { name: 'Test title 1' })
    ).toBeInTheDocument();
    expect(firstCard.getByText('investigations.name:')).toBeInTheDocument();
    expect(firstCard.getByText('Test 1')).toBeInTheDocument();
    expect(
      firstCard.getByRole('link', { name: 'Data.Publication.Pid' })
    ).toHaveAttribute('href', 'https://doi.org/Data.Publication.Pid');
    expect(
      firstCard.getByText('investigations.details.size:')
    ).toBeInTheDocument();
    expect(firstCard.getByText('123 B')).toBeInTheDocument();
    expect(
      firstCard.getByText('investigations.principal_investigators:')
    ).toBeInTheDocument();
    expect(firstCard.getByText('Test PI')).toBeInTheDocument();
    expect(
      firstCard.getByText('investigations.details.start_date:')
    ).toBeInTheDocument();
    expect(firstCard.getByText('2022-01-01')).toBeInTheDocument();
    expect(
      firstCard.getByText('investigations.details.end_date:')
    ).toBeInTheDocument();
    expect(firstCard.getByText('2022-01-03')).toBeInTheDocument();
  });

  it('renders no card if no investigation is returned', async () => {
    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations\/count$/.test(url)) {
          // investigation count query
          return Promise.resolve({
            data: 0,
          });
        }

        if (/\/investigations$/.test(url)) {
          // investigations query
          return Promise.resolve({
            data: [],
          });
        }

        if (/\/user\/getSize$/.test(url)) {
          // investigation size query
          return Promise.resolve({
            data: 123,
          });
        }

        return Promise.reject({
          response: { status: 403 },
          message: `Endpoint not mocked: ${url}`,
        });
      });

    renderComponent();
    await flushPromises();

    expect(screen.queryAllByTestId('card')).toHaveLength(0);
  });

  it('correct link used when NOT in studyHierarchy', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation/1'
    );
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'Filter by investigations.title',
      hidden: true,
    });

    await user.type(filter, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filter);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    // click on button to show advanced filters
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    const filter = await screen.findByRole('textbox', {
      name: 'investigations.details.end_date filter to',
    });

    await user.type(filter, '2019-08-06');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filter);
    await user.click(filter);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('displays the correct user as the PI ', async () => {
    renderComponent();
    expect(await screen.findByText('Test PI')).toBeInTheDocument();
  });

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?sort=${encodeURIComponent('{"startDate":"desc"}')}`,
    });

    // check that the data request is sent only once after mounting
    const datafilesCalls = (axios.get as jest.Mock).mock.calls.filter(
      (call) => call[0] === '/investigations'
    );
    expect(datafilesCalls).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();
    await user.click(
      await screen.findByRole('button', {
        name: 'Sort by INVESTIGATIONS.TITLE',
      })
    );
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders buttons correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.add_to_cart' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });

  it('displays details panel when more information is expanded and navigates to datasets view when tab clicked', async () => {
    renderComponent();
    await user.click(await screen.findByLabelText('card-more-info-expand'));
    expect(
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeTruthy();
    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );
    expect(history.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset'
    );
  });
});
