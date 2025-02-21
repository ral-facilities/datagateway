import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      fileSize: 1,
      investigationInstruments: [
        {
          id: 1,
          instrument: {
            id: 3,
            name: 'LARMOR',
          },
        },
      ],
      dataCollectionInvestigations: [
        {
          id: 1,
          investigation: {
            id: 1,
            title: 'Test 1',
            name: 'Test 1',
            visitId: '1',
          },
          dataCollection: {
            id: 11,
            dataPublications: [
              {
                id: 12,
                pid: 'Data Publication Pid',
                description: 'Data Publication description',
                title: 'Data Publication',
                type: {
                  id: 15,
                  name: 'investigation',
                },
              },
            ],
          },
        },
        {
          id: 2,
          investigation: {
            id: 1,
            title: 'Test 1',
            name: 'Test 1',
            visitId: '1',
          },
          dataCollection: {
            id: 13,
            dataPublications: [
              {
                id: 14,
                pid: 'Data Publication Study Pid',
                description: 'Data Publication description',
                title: 'Data Publication Study',
                type: {
                  id: 16,
                  name: 'study',
                },
              },
            ],
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

  it('should render correctly', async () => {
    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tablist', {
        name: 'investigations.details.tabs_label',
      })
    ).toBeInTheDocument();
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

    const link2 = await screen.findByRole('link', {
      name: /Data Publication Study Pid/,
    });

    expect(link2).toHaveTextContent('Data Publication Study Pid');
    expect(link2).toHaveAttribute(
      'href',
      'https://doi.org/Data Publication Study Pid'
    );
  });

  it('should gracefully handles dataCollectionInvestigations without dataPublications and InvestigationUsers without Users', async () => {
    rowData.dataCollectionInvestigations = [
      {
        id: 1,
      },
    ];

    rowData.investigationUsers = [
      {
        id: 4,
        role: 'Investigator',
      },
    ];

    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tablist', {
        name: 'investigations.details.tabs_label',
      })
    ).toBeInTheDocument();
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

    (axios.get as jest.Mock).mockResolvedValueOnce({
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
