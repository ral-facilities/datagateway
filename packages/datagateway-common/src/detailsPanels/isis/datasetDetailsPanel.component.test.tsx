import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import type { Dataset, DatasetType } from '../../app.types';
import { StateType } from '../../state/app.types';
import dGCommonReducer from '../../state/reducers/dgcommon.reducer';
import DatasetDetailsPanel from './datasetDetailsPanel.component';

function renderComponent({
  rowData,
  detailsPanelResize = vi.fn(),
  viewDatafiles,
}: {
  rowData: Dataset;
  detailsPanelResize?: () => void;
  viewDatafiles?: (id: number) => void;
}): RenderResult {
  return render(
    <Provider
      store={createStore(
        combineReducers<Partial<StateType>>({ dgcommon: dGCommonReducer })
      )}
    >
      <QueryClientProvider client={new QueryClient()}>
        <DatasetDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatafiles={viewDatafiles}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('Dataset details panel component', () => {
  let rowData: Dataset;
  let rowDatasetType: DatasetType;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    rowDatasetType = {
      id: 2,
      name: 'Test 2',
    };
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
      description: 'Test description',
      type: rowDatasetType,
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
        name: 'datasets.details.tabs_label',
      })
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show default tab on first render', async () => {
    renderComponent({ rowData });
    expect(
      await screen.findByRole('tab', { name: 'datasets.details.label' })
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('should render type tab when present in the data', async () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const { asFragment } = renderComponent({ rowData });

    expect(
      await screen.findByRole('tab', { name: 'datasets.details.type.label' })
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should let user switch between tabs', async () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    renderComponent({ rowData });

    expect(
      await screen.findByRole('tabpanel', { name: 'datasets.details.label' })
    ).toBeVisible();

    // switch tab
    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.type.label' })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'datasets.details.type.label',
      })
    ).toBeVisible();
  });

  it('should call detailsPanelResize on load and when tabs are switched between', async () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };
    const mockDetailsPanelResize = vi.fn();

    renderComponent({
      rowData,
      detailsPanelResize: mockDetailsPanelResize,
    });

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(1);
    });

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.type.label' })
    );

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(2);
    });
  });

  it('should not call detailsPanelResize when not provided', async () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };
    const mockDetailsPanelResize = vi.fn();

    renderComponent({ rowData });

    await waitFor(() => {
      expect(mockDetailsPanelResize).not.toHaveBeenCalled();
    });

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.type.label' })
    );

    await waitFor(() => {
      expect(mockDetailsPanelResize).not.toHaveBeenCalled();
    });
  });

  it('should show "No <field> provided" incase of a null field', async () => {
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    renderComponent({ rowData });

    expect(
      await screen.findByText('datasets.details.description not provided')
    ).toBeInTheDocument();
  });

  it('should call datafile view if view datafiles tab clicked', async () => {
    const mockViewDatafiles = vi.fn();

    renderComponent({
      rowData,
      viewDatafiles: mockViewDatafiles,
    });

    expect(mockViewDatafiles).not.toHaveBeenCalled();

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
    );

    expect(mockViewDatafiles).toHaveBeenCalled();
  });
});
