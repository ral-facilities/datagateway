import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { Datafile, Dataset } from '../../app.types';
import { StateType } from '../../state/app.types';
import dGCommonReducer from '../../state/reducers/dgcommon.reducer';
import DatasetDetailsPanel from './datasetDetailsPanel.component';

function renderComponent({
  rowData,
  detailsPanelResize,
}: {
  rowData: Datafile;
  detailsPanelResize?: () => void;
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
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('Dataset details panel component', () => {
  let rowData: Dataset;

  beforeEach(() => {
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
      description: 'Test description',
      startDate: '2019-06-11',
      endDate: '2019-06-12',
      fileSize: 64,
      fileCount: 1,
      type: {
        id: 2,
        name: 'Test 2',
      },
    };

    axios.get = vi.fn().mockImplementation((url: string) => {
      if (/.*\/datasets$/.test(url))
        return Promise.resolve({
          data: [rowData],
        });

      if (/.*\/user\/getSize$/g.test(url))
        return Promise.resolve({
          data: 89,
        });

      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const { asFragment } = renderComponent({ rowData });
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls detailsPanelResize on load', async () => {
    const mockDetailsPanelResize = vi.fn();

    renderComponent({
      rowData,
      detailsPanelResize: mockDetailsPanelResize,
    });

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(1);
    });
  });

  it('Shows "No <field> provided" in case of a null field', async () => {
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
});
