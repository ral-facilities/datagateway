import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import axios from 'axios';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { StateType } from '../../../lib';

import type { Investigation } from '../../app.types';
import dGCommonReducer from '../../state/reducers/dgcommon.reducer';
import InvestigationDetailsPanel from './investigationDetailsPanel.component';

function renderComponent({
  rowData,
  detailsPanelResize,
  viewDatasets,
}: {
  rowData: Investigation;
  detailsPanelResize?: () => void;
  viewDatasets?: () => void;
}): RenderResult {
  return render(
    <Provider
      store={createStore(
        combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
      )}
    >
      <QueryClientProvider client={new QueryClient()}>
        <InvestigationDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatasets={viewDatasets}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('Investigation details panel component', () => {
  let rowData: Investigation;
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    rowData = {
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
        },
      ],
      studyInvestigations: [
        {
          id: 11,
          study: {
            id: 12,
            pid: 'study pid',
            name: 'study',
            modTime: '2019-06-10',
            createTime: '2019-06-11',
          },
        },
      ],
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: [rowData],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { asFragment } = renderComponent({ rowData });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render user, sample and publication tabs when present in the data', () => {
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

    const { asFragment } = renderComponent({ rowData });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should check if multiple samples result in change of title to plural version', () => {
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
    expect(asFragment()).toMatchSnapshot();
  });

  it('should check if multiple publications result in change of title to plural version', () => {
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
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render publications tab and text "No publications" when no data is present', async () => {
    rowData.publications = [];
    renderComponent({ rowData });
    expect(
      await screen.findByText(
        'investigations.details.publications.no_publications'
      )
    ).toBeInTheDocument();
  });

  it('should render samples tab and text "No samples" when no data is present', async () => {
    rowData.samples = [];
    renderComponent({ rowData });
    expect(
      await screen.findByText('investigations.details.samples.no_samples')
    ).toBeInTheDocument();
  });

  it('should render users tab and text "No users" when no data is present', async () => {
    rowData.investigationUsers = [];
    renderComponent({ rowData });
    expect(
      await screen.findByText('investigations.details.users.no_name')
    ).toBeInTheDocument();
  });

  it('should let user switch between tabs', async () => {
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

    renderComponent({ rowData });

    expect(
      await screen.findByRole('tabpanel', {
        name: 'investigations.details.label',
      })
    ).toBeVisible();

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.users.label',
      })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'investigations.details.users.label',
      })
    ).toBeVisible();

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.samples.label',
      })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'investigations.details.samples.label',
      })
    ).toBeVisible();

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.publications.label',
      })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'investigations.details.publications.label',
      })
    );
  });

  it('should call detailsPanelResize on load and when tabs are switched between', async () => {
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
        name: 'investigations.details.publications.label',
      })
    );

    expect(mockDetailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('should display DOI and render the expected Link ', async () => {
    renderComponent({ rowData });

    const link = await screen.findByRole('link', { name: /doi 1/ });

    expect(link).toHaveTextContent('doi 1');
    expect(link).toHaveAttribute('href', 'https://doi.org/doi 1');
  });

  it('should gracefully handles StudyInvestigations without Studies and InvestigationUsers without Users', () => {
    rowData.studyInvestigations = [
      {
        id: 11,
      },
    ];

    rowData.investigationUsers = [
      {
        id: 4,
        role: 'Investigator',
      },
    ];

    const { asFragment } = renderComponent({ rowData });
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls dataset view if view datasets tab clicked', async () => {
    const mockViewDatasets = jest.fn();

    renderComponent({
      rowData,
      viewDatasets: mockViewDatasets,
    });

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );
    expect(mockViewDatasets).toHaveBeenCalledTimes(1);
  });

  it('Shows "No <field> provided" incase of a null field', async () => {
    const { summary, doi, startDate, endDate, ...amendedRowData } = rowData;

    (axios.get as jest.Mock).mockReturnValueOnce({
      data: amendedRowData,
    });

    renderComponent({ rowData: amendedRowData });

    expect(
      await screen.findByText('investigations.details.summary not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.doi not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.start_date not provided')
    ).toBeInTheDocument();
    expect(
      screen.getByText('investigations.details.end_date not provided')
    ).toBeInTheDocument();
  });
});
