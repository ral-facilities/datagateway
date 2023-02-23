import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import axios from 'axios';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import type { StateType } from '../../../lib';

import type { Datafile } from '../../app.types';
import dGCommonReducer from '../../state/reducers/dgcommon.reducer';
import DatafileDetailsPanel from './datafileDetailsPanel.component';

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
        <DatafileDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('Datafile details panel component', () => {
  let rowData: Datafile;
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
      description: 'Test description',
    };
    axios.get = jest.fn().mockResolvedValue({
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

  it('should show default tab on first render', async () => {
    renderComponent({
      rowData,
    });

    expect(
      await screen.findByRole('tab', { name: 'datafiles.details.label' })
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('should let user switch between tabs', async () => {
    rowData.parameters = [
      {
        id: 2,
        stringValue: 'String test',
        type: {
          id: 3,
          name: 'String parameter',
          units: 'foo/s',
          valueType: 'STRING',
        },
      },
    ];

    renderComponent({ rowData });

    expect(
      await screen.findByRole('tabpanel', { name: 'datafiles.details.label' })
    ).toBeVisible();

    // switch tab
    await user.click(
      await screen.findByRole('tab', {
        name: 'datafiles.details.parameters.label',
      })
    );

    expect(
      await screen.findByRole('tabpanel', {
        name: 'datafiles.details.parameters.label',
      })
    ).toBeVisible();
  });

  it('should render parameters tab when present in the data', () => {
    rowData.parameters = [
      {
        id: 2,
        stringValue: 'String test',
        type: {
          id: 3,
          name: 'String parameter',
          units: 'foo/s',
          valueType: 'STRING',
        },
      },
      {
        id: 4,
        numericValue: 1337,
        type: {
          id: 5,
          name: 'Numeric parameter',
          units: 'bar/s',
          valueType: 'NUMERIC',
        },
      },
      {
        id: 6,
        dateTimeValue: '2019-09-10 11:48:00',
        type: {
          id: 7,
          name: 'Datetime parameter',
          units: 'baz/s',
          valueType: 'DATE_AND_TIME',
        },
      },
      {
        id: 8,
        dateTimeValue: '2019-09-10 11:48:00',
        type: {
          id: 9,
          name: 'Invalid parameter',
          units: 'n/a',
          valueType: '',
        },
      },
      {
        id: 10,
        stringValue: 'Missing PARAMETERTYPE',
      },
    ];

    const { asFragment } = renderComponent({
      rowData,
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('should call detailsPanelResize on load and when tabs are switched between', async () => {
    rowData.parameters = [
      {
        id: 2,
        stringValue: 'String test',
        type: {
          id: 3,
          name: 'String parameter',
          units: 'foo/s',
          valueType: 'STRING',
        },
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
        name: 'datafiles.details.parameters.label',
      })
    );

    await waitFor(() => {
      expect(mockDetailsPanelResize).toHaveBeenCalledTimes(2);
    });
  });

  it('should not call detailsPanelResize if not provided', async () => {
    rowData.parameters = [
      {
        id: 2,
        stringValue: 'String test',
        type: {
          id: 3,
          name: 'String parameter',
          units: 'foo/s',
          valueType: 'STRING',
        },
      },
    ];
    const mockDetailsPanelResize = jest.fn();

    renderComponent({ rowData });

    await user.click(
      await screen.findByRole('tab', {
        name: 'datafiles.details.parameters.label',
      })
    );

    expect(mockDetailsPanelResize).not.toHaveBeenCalled();
  });

  it('should show "No <field> provided" incase of a null field', async () => {
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    axios.get = jest.fn().mockResolvedValue({
      data: [rowData],
    });

    renderComponent({ rowData });

    expect(
      await screen.findByText('datafiles.details.description not provided')
    ).toBeInTheDocument();
  });

  it('should render datafile parameters tab and text "No parameters" when no data is present', async () => {
    rowData.parameters = [];
    axios.get = jest.fn().mockResolvedValue({
      data: [rowData],
    });

    renderComponent({ rowData });

    expect(
      await screen.findByText('datafiles.details.parameters.no_parameters')
    ).toBeInTheDocument();
  });
});
