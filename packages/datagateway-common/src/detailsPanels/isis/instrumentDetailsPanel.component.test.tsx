import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import type { Instrument } from '../../app.types';
import { StateType } from '../../state/app.types';
import dGCommonReducer from '../../state/reducers/dgcommon.reducer';
import InstrumentDetailsPanel from './instrumentDetailsPanel.component';

function renderComponent({
  rowData,
  detailsPanelResize,
}: {
  rowData: Instrument;
  detailsPanelResize?: () => void;
}): RenderResult {
  return render(
    <Provider
      store={createStore(
        combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
      )}
    >
      <QueryClientProvider client={new QueryClient()}>
        <InstrumentDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('Instrument details panel component', () => {
  let rowData: Instrument;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    rowData = {
      id: 1,
      name: 'Test',
      fullName: 'Test Instrument',
      description: 'An instrument purely for testing',
      type: 'testing',
      url: 'www.example.com',
    };

    axios.get = vi.fn().mockResolvedValue({
      data: [rowData],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tablist', {
        name: 'instruments.details.tabs_label',
      })
    ).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show default tab on first render', async () => {
    renderComponent({ rowData });
    expect(
      await screen.findByRole('tab', { name: 'instruments.details.label' })
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('should render users tab when present in the data', async () => {
    rowData.instrumentScientists = [
      {
        id: 4,
        user: {
          id: 5,
          name: 'Louise',
          fullName: 'Louise Davies',
        },
      },
      {
        id: 9,
        user: {
          id: 10,
          name: 'Louise',
        },
      },
    ];

    const { asFragment } = renderComponent({ rowData });

    expect(
      await screen.findByRole('tab', {
        name: 'instruments.details.instrument_scientists.label',
      })
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should let user switch between tabs', async () => {
    rowData.instrumentScientists = [
      {
        id: 4,
        user: {
          id: 5,
          name: 'Rick',
          fullName: 'Rick Ashley',
        },
      },
    ];

    renderComponent({ rowData });

    expect(
      await screen.findByRole('tabpanel', { name: 'instruments.details.label' })
    ).toBeVisible();

    // switch tab
    await user.click(
      await screen.findByRole('tab', {
        name: 'instruments.details.instrument_scientists.label',
      })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'instruments.details.instrument_scientists.label',
      })
    ).toBeVisible();
  });

  it('should call detailsPanelResize on load and when tabs are switched between', async () => {
    rowData.instrumentScientists = [
      {
        id: 4,
        user: {
          id: 5,
          name: 'Louise',
          fullName: 'Louise Davies',
        },
      },
    ];

    const mockDetailsPanelResize = vi.fn();

    renderComponent({
      rowData,
      detailsPanelResize: mockDetailsPanelResize,
    });

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(1);
    });

    await user.click(
      await screen.findByRole('tab', {
        name: 'instruments.details.instrument_scientists.label',
      })
    );

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(2);
    });
  });

  it('should gracefully handle InstrumentScientists without Users', async () => {
    rowData.instrumentScientists = [
      {
        id: 4,
      },
    ];

    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tablist', {
        name: 'instruments.details.tabs_label',
      })
    ).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render users tab and text "No Scientists" when no data is present', async () => {
    rowData.instrumentScientists = [];
    renderComponent({ rowData });
    expect(
      await screen.findByText(
        'instruments.details.instrument_scientists.no_name'
      )
    ).toBeInTheDocument();
  });

  it('should show "No <field> provided" incase of a null field', async () => {
    const { description, type, url, ...amendedRowData } = rowData;
    axios.get = vi.fn().mockResolvedValue({
      data: [amendedRowData],
    });

    renderComponent({ rowData: amendedRowData });

    expect(
      await screen.findByText('instruments.details.description not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('instruments.details.type not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('instruments.details.url not provided')
    ).toBeInTheDocument();
  });

  it('should display shortened instrument name if full name not provided', async () => {
    rowData = {
      id: 1,
      name: 'My test instrument',
      description: 'An instrument purely for testing',
      type: 'testing',
      url: 'www.example.com',
    };

    renderComponent({ rowData });

    expect(await screen.findByText('My test instrument')).toBeInTheDocument();
  });
});
