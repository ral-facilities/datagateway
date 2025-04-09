import { type DataPublication, dGCommonInitialState } from 'datagateway-common';
import { Provider } from 'react-redux';
import { generatePath, Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISDataPublicationsCardView from './isisDataPublicationsCardView.component';
import { createMemoryHistory, type History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { paths } from '../../../page/pageContainer.component';

describe('ISIS Data Publication - Card View', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let cardData: DataPublication[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (studyDataPublicationId?: string): RenderResult => {
    if (studyDataPublicationId)
      history.replace(
        generatePath(
          paths.dataPublications.toggle.isisInvestigationDataPublication,
          {
            instrumentId: 1,
            studyDataPublicationId,
          }
        )
      );
    return render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDataPublicationsCardView
              instrumentId="1"
              studyDataPublicationId={studyDataPublicationId}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    cardData = [
      {
        id: 14,
        pid: 'doi',
        title: 'Test 1',
        description: 'Data Publication Description',
        publicationDate: '2001-01-01',
        content: {
          id: 1,
          dataCollectionInvestigations: [
            {
              id: 1,
              investigation: {
                id: 711,
                title: 'investigation title',
                name: 'investigation name',
                visitId: 'IPim0',
                startDate: '1999-01-01',
                endDate: '1999-01-02',
              },
            },
          ],
        },
      },
    ];
    history = createMemoryHistory({
      initialEntries: [
        generatePath(paths.dataPublications.toggle.isisStudyDataPublication, {
          instrumentId: 1,
        }),
      ],
    });

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    user = userEvent.setup();

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        switch (url) {
          case '/datapublications':
            return Promise.resolve({
              data: cardData,
            });

          case '/datapublications/count':
            return Promise.resolve({
              data: 1,
            });
          default:
            return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    // Prevent error logging
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Study Data Publication', () => {
    it('renders correctly', async () => {
      renderComponent();

      const cards = await screen.findAllByTestId('card');
      expect(cards).toHaveLength(1);

      const card = cards[0];
      // card id should be rendered as link to data publication
      expect(
        within(card).getByRole('link', { name: 'Test 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/1/dataPublication/14'
      );
      expect(within(card).getByLabelText('card-description')).toHaveTextContent(
        'Data Publication Description'
      );
      expect(within(card).getByRole('link', { name: 'doi' })).toHaveAttribute(
        'href',
        'https://doi.org/doi'
      );
    });

    it('uses default sort', async () => {
      renderComponent();

      expect(await screen.findByTestId('card')).toBeInTheDocument();

      expect(history.length).toBe(1);
      expect(history.location.search).toBe(
        `?sort=${encodeURIComponent('{"title":"desc"}')}`
      );

      // check that the data request is sent only once after mounting
      const datafilesCalls = vi
        .mocked(axios.get)
        .mock.calls.filter((call) => call[0] === '/datapublications');
      expect(datafilesCalls).toHaveLength(1);
    });

    it('updates filter query params on text filter', async () => {
      renderComponent();

      // click on button to show advanced filters
      await user.click(
        await screen.findByRole('button', { name: 'advanced_filters.show' })
      );

      const filter = await screen.findByRole('textbox', {
        name: 'Filter by datapublications.title',
        hidden: true,
      });

      await user.type(filter, 'Test');

      expect(history.location.search).toBe(
        `?filters=${encodeURIComponent(
          '{"title":{"value":"Test","type":"include"}}'
        )}`
      );

      await user.clear(filter);

      expect(history.location.search).toBe('?');
    });

    it('updates sort query params on sort', async () => {
      renderComponent();

      await user.click(
        await screen.findByRole('button', {
          name: 'Sort by DATAPUBLICATIONS.PID',
        })
      );

      expect(history.location.search).toBe(
        `?sort=${encodeURIComponent('{"pid":"asc"}')}`
      );
    });
  });

  describe('Investigation Data Publication', () => {
    it('renders correctly', async () => {
      renderComponent('2');

      const cards = await screen.findAllByTestId('card');
      expect(cards).toHaveLength(1);

      const card = cards[0];
      // card id should be rendered as link to data publication
      expect(
        within(card).getByRole('link', { name: 'Test 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/1/dataPublication/2/investigation/14'
      );
      expect(within(card).getByLabelText('card-description')).toHaveTextContent(
        'Data Publication Description'
      );
      expect(within(card).getByRole('link', { name: 'doi' })).toHaveAttribute(
        'href',
        'https://doi.org/doi'
      );
      expect(within(card).getByText('2001-01-01')).toBeInTheDocument();
    });

    it('uses default sort', async () => {
      renderComponent('2');

      expect(await screen.findByTestId('card')).toBeInTheDocument();

      expect(history.length).toBe(1);
      expect(history.location.search).toBe(
        `?sort=${encodeURIComponent('{"publicationDate":"desc"}')}`
      );

      // check that the data request is sent only once after mounting
      const datafilesCalls = vi
        .mocked(axios.get)
        .mock.calls.filter((call) => call[0] === '/datapublications');
      expect(datafilesCalls).toHaveLength(1);
    });

    it('updates filter query params on date filter', async () => {
      renderComponent('2');

      // open advanced filter
      await user.click(
        await screen.findByRole('button', { name: 'advanced_filters.show' })
      );

      const filterInput = screen.getByRole('textbox', {
        name: 'datapublications.publication_date filter to',
      });

      await user.type(filterInput, '2019-08-06');
      expect(history.location.search).toBe(
        `?filters=${encodeURIComponent(
          '{"publicationDate":{"endDate":"2019-08-06"}}'
        )}`
      );

      // await user.clear(filterInput);
      await user.click(filterInput);
      await user.keyboard('{Control}a{/Control}');
      await user.keyboard('{Delete}');

      expect(history.location.search).toBe('?');
    });
  });
});
