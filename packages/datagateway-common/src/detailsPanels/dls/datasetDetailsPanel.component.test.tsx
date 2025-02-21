import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { StateType } from '../../../lib';
import { Datafile, Dataset } from '../../app.types';
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
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
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

    axios.get = jest.fn().mockImplementation((url: string) => {
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
    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    const { asFragment } = renderComponent({ rowData });
    expect(
      await screen.findByRole('tablist', {
        name: 'datasets.details.tabs_label',
      })
    ).toBeInTheDocument();
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
      await screen.findByRole('tab', {
        name: 'datasets.details.type.label',
      })
    ).toBeInTheDocument();
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
    expect(
      screen.queryByRole('tabpanel', { name: 'datasets.details.type.label' })
    ).toBeNull();

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.type.label' })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'datasets.details.type.label',
      })
    ).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'datasets.details.label' })
    ).toBeNull();
  });

  it('calls detailsPanelResize on load and when tabs are switched between', async () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };
    const mockDetailsPanelResize = jest.fn();

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

  it('Shows "No <field> provided" incase of a null field', async () => {
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
