import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { dGCommonInitialState } from '../..';
import { StateType } from '../../../lib';
import { Investigation } from '../../app.types';
import dGCommonReducer from '../../state/reducers/dgcommon.reducer';
import VisitDetailsPanel from './visitDetailsPanel.component';

function renderComponent({
  rowData,
  detailsPanelResize,
}: {
  rowData: Investigation;
  detailsPanelResize?: () => void;
}): RenderResult {
  return render(
    <Provider
      store={createStore(
        combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer }),
        { dgcommon: { ...dGCommonInitialState, accessMethods: {} } }
      )}
    >
      <QueryClientProvider client={new QueryClient()}>
        <VisitDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('Visit details panel component', () => {
  let rowData: Investigation;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    rowData = {
      id: 1,
      title: 'Test 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      fileSize: 64,
      fileCount: 1,
      investigationInstruments: [
        {
          id: 1,
          instrument: {
            id: 3,
            name: 'LARMOR',
          },
        },
      ],
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    };

    axios.get = jest.fn().mockImplementation((url: string) => {
      if (/.*\/investigations/.test(url))
        return Promise.resolve({ data: [rowData] });

      if (/.*\/user\/getSize/.test(url)) return Promise.resolve({ data: 64 });

      if (/.*\/queue\/allowed/.test(url))
        return Promise.resolve({ data: true });

      return Promise.resolve();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tablist', {
        name: 'investigations.details.tabs_label',
      })
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'buttons.queue_visit' }));

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show default tab on first render', async () => {
    renderComponent({ rowData });
    expect(
      await screen.findByRole('tab', { name: 'investigations.details.label' })
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('should render user, sample and publication tabs when present in the data', async () => {
    rowData.investigationUsers = [
      {
        id: 4,
        role: 'Investigator',
        user: {
          id: 5,
          name: 'Louise',
          fullName: 'Louise Davies',
        },
      },
      {
        id: 9,
        role: 'Investigator',
        user: {
          id: 10,
          name: 'Louise',
        },
      },
    ];

    rowData.samples = [
      {
        id: 7,
        name: 'Test sample',
      },
    ];

    rowData.publications = [
      {
        id: 8,
        fullReference: 'Test publication',
      },
    ];

    rowData.parameters = [
      {
        id: 9,
        type: {
          id: 10,
          name: 'Number Param',
          units: 'm',
          valueType: 'NUMERIC',
        },
        numericValue: 1,
      },
      {
        id: 11,
        type: {
          id: 12,
          name: 'String Param',
          units: 'm',
          valueType: 'STRING',
        },
        stringValue: 'test string param',
      },
      {
        id: 13,
        type: {
          id: 14,
          name: 'Number Param',
          units: 'm',
          valueType: 'DATE_AND_TIME',
        },
        dateTimeValue: '2023-06-29 00:00:00Z',
      },
    ];

    const { asFragment } = renderComponent({ rowData });

    expect(
      await screen.findByRole('tab', {
        name: 'investigations.details.users.label',
      })
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should check if multiple samples result in change of title to plural version', async () => {
    rowData.samples = [
      {
        id: 7,
        name: 'Test sample',
      },
      {
        id: 8,
        name: 'Test sample 1',
      },
    ];

    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tab', {
        name: 'investigations.details.samples.label',
      })
    ).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should check if multiple publications result in change of title to plural version', async () => {
    rowData.publications = [
      {
        id: 8,
        fullReference: 'Test publication',
      },
      {
        id: 9,
        fullReference: 'Test publication 1',
      },
    ];

    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tab', {
        name: 'investigations.details.publications.label',
      })
    ).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call detailsPanelResize on load and when tabs are switched between', async () => {
    rowData.investigationUsers = [
      {
        id: 4,
        role: 'Investigator',
        user: {
          id: 5,
          name: 'Louise',
          fullName: 'Louise Davies',
        },
      },
      {
        id: 9,
        role: 'Investigator',
        user: {
          id: 10,
          name: 'Louise',
        },
      },
    ];

    rowData.samples = [
      {
        id: 7,
        name: 'Test sample',
      },
    ];

    rowData.publications = [
      {
        id: 8,
        fullReference: 'Test publication',
      },
    ];

    const mockDetailsPanelResize = jest.fn();

    renderComponent({
      rowData,
      detailsPanelResize: mockDetailsPanelResize,
    });

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(1);
    });

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.users.label',
      })
    );

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(2);
    });
  });

  it('should gracefully handles InvestigationUsers without Users', async () => {
    rowData.investigationUsers = [
      {
        id: 4,
        role: 'Investigator',
      },
    ];

    const { asFragment } = renderComponent({ rowData });

    expect(
      await screen.findByRole('tab', {
        name: 'investigations.details.users.label',
      })
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows "No <field> provided" incase of a null field', async () => {
    const { summary, startDate, endDate, ...amendedRowData } = rowData;

    axios.get = jest.fn().mockResolvedValue({
      data: [amendedRowData],
    });

    renderComponent({ rowData: amendedRowData });

    expect(
      await screen.findByText('investigations.details.start_date not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.end_date not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.summary not provided')
    ).toBeInTheDocument();
  });
});
