import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { dGCommonInitialState, type DataPublication } from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
  flushPromises,
} from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import ISISDataPublicationsTable from './isisDataPublicationsTable.component';

describe('ISIS Data Publication table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: DataPublication[];
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (studyDataPublicationId?: string): RenderResult => {
    window.history.replaceState(
      {},
      '',
      generatePath(paths.dataPublications.toggle.isisStudyDataPublication, {
        instrumentId: 1,
      })
    );
    if (studyDataPublicationId)
      window.history.replaceState(
        {},
        '',
        generatePath(
          paths.dataPublications.toggle.isisInvestigationDataPublication,
          {
            instrumentId: 1,
            studyDataPublicationId,
          }
        )
      );
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.dataPublications.toggle.isisStudyDataPublication}
                element={<ISISDataPublicationsTable />}
              />
              <Route
                path={
                  paths.dataPublications.toggle.isisInvestigationDataPublication
                }
                element={<ISISDataPublicationsTable />}
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    rowData = [
      {
        id: 1,
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
    user = userEvent.setup({
      delay: null,
    });

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        switch (url) {
          case '/datapublications':
            return Promise.resolve({
              data: rowData,
            });

          case '/datapublications/count':
            return Promise.resolve({
              data: 1,
              isPending: false,
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

      let rows: HTMLElement[] = [];
      await waitFor(async () => {
        rows = await findAllRows();
        // should have 1 row in the table
        expect(rows).toHaveLength(1);
      });

      expect(
        await findColumnHeaderByName('datapublications.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datapublications.pid')
      ).toBeInTheDocument();

      const row = rows[0];

      // check that every cell contains the correct values
      expect(
        within(
          findCellInRow(row, {
            columnIndex: await findColumnIndexByName('datapublications.title'),
          })
        ).getByText('Test 1')
      ).toBeInTheDocument();
      expect(
        within(
          findCellInRow(row, {
            columnIndex: await findColumnIndexByName('datapublications.pid'),
          })
        ).getByText('doi')
      ).toBeInTheDocument();
    });

    it('updates filter query params on text filter', async () => {
      renderComponent();

      const filterInput = await screen.findByRole('textbox', {
        name: 'Filter by datapublications.title',
        hidden: true,
      });

      await user.type(filterInput, 'test');

      // user.type inputs the given string character by character to simulate user typing
      // each keystroke of user.type creates a new entry in the history stack
      // so the initial entry + 4 characters in "test" = 5 entries

      expect(window.location.search).toContain(
        `?filters=${encodeURIComponent(
          '{"title":{"value":"test","type":"include"}}'
        )}`
      );

      await user.clear(filterInput);

      expect(window.location.search).not.toContain('filters=');
    });

    it('uses default sort', async () => {
      renderComponent();

      await act(async () => {
        await flushPromises();
      });

      expect(await screen.findAllByRole('gridcell')).toBeTruthy();

      expect(window.location.search).toBe(
        `?sort=${encodeURIComponent('{"title":"desc"}')}`
      );

      // check that the data request is sent only once after mounting
      const datafilesCalls = vi
        .mocked(axios.get)
        .mock.calls.filter((call) => call[0] === '/datapublications');
      expect(datafilesCalls).toHaveLength(1);
    });

    it('updates sort query params on sort', async () => {
      renderComponent();

      await user.click(
        await screen.findByRole('button', { name: 'datapublications.pid' })
      );

      expect(window.location.search).toBe(
        `?sort=${encodeURIComponent('{"pid":"asc"}')}`
      );
    });

    it('renders data publication name as a link', async () => {
      renderComponent();

      const dataPublicationIdColIndex = await findColumnIndexByName(
        'datapublications.title'
      );
      const row = await findRowAt(0);
      const dataPublicationIdCell = findCellInRow(row, {
        columnIndex: dataPublicationIdColIndex,
      });

      expect(
        within(dataPublicationIdCell).getByRole('link', { name: 'Test 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/1/dataPublication/1'
      );
    });

    it('displays Experiment DOI (PID) and renders the expected Link ', async () => {
      renderComponent();

      const pidColIndex = await findColumnIndexByName('datapublications.pid');
      const row = await findRowAt(0);
      const pidCell = findCellInRow(row, { columnIndex: pidColIndex });

      expect(
        within(pidCell).getByRole('link', { name: 'doi' })
      ).toHaveAttribute('href', 'https://doi.org/doi');
    });
  });

  describe('Investigation Data Publication', () => {
    it('renders correctly', async () => {
      renderComponent('2');

      let rows: HTMLElement[] = [];
      await waitFor(async () => {
        rows = await findAllRows();
        // should have 1 row in the table
        expect(rows).toHaveLength(1);
      });

      expect(
        await findColumnHeaderByName('datapublications.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datapublications.pid')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datapublications.publication_date')
      ).toBeInTheDocument();

      const row = rows[0];

      // check that every cell contains the correct values
      expect(
        within(
          findCellInRow(row, {
            columnIndex: await findColumnIndexByName('datapublications.title'),
          })
        ).getByText('Test 1')
      ).toBeInTheDocument();
      expect(
        within(
          findCellInRow(row, {
            columnIndex: await findColumnIndexByName('datapublications.pid'),
          })
        ).getByText('doi')
      ).toBeInTheDocument();
    });

    it('updates filter query params on date filter', async () => {
      renderComponent('2');

      const filterInput = await screen.findByRole('textbox', {
        name: 'datapublications.publication_date filter to',
      });

      await user.type(filterInput, '2019-08-06');

      expect(window.location.search).toContain(
        `?filters=${encodeURIComponent(
          '{"publicationDate":{"endDate":"2019-08-06"}}'
        )}`
      );

      // await user.clear(filterInput);
      await user.click(filterInput);
      await user.keyboard('{Control}a{/Control}');
      await user.keyboard('{Delete}');

      expect(window.location.search).not.toContain('filters=');
    });

    it('uses default sort', async () => {
      renderComponent('2');

      await act(async () => {
        await flushPromises();
      });

      expect(await screen.findAllByRole('gridcell')).toBeTruthy();

      expect(window.location.search).toBe(
        `?sort=${encodeURIComponent('{"publicationDate":"desc"}')}`
      );

      // check that the data request is sent only once after mounting
      const datafilesCalls = vi
        .mocked(axios.get)
        .mock.calls.filter((call) => call[0] === '/datapublications');
      expect(datafilesCalls).toHaveLength(1);
    });

    it('renders data publication name as a link', async () => {
      renderComponent('2');

      const dataPublicationIdColIndex = await findColumnIndexByName(
        'datapublications.title'
      );
      const row = await findRowAt(0);
      const dataPublicationIdCell = findCellInRow(row, {
        columnIndex: dataPublicationIdColIndex,
      });

      expect(
        within(dataPublicationIdCell).getByRole('link', { name: 'Test 1' })
      ).toHaveAttribute(
        'href',
        '/browseDataPublications/instrument/1/dataPublication/2/investigation/1'
      );
    });
  });
});
