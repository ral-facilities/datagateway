import React from 'react';
import DatafileDetailsPanel from './datafileDetailsPanel.component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Datafile } from '../../app.types';
import { useDatafileDetails } from '../../api';
import { render, RenderResult } from '@testing-library/react';

vi.mock('../../api/datafiles');

describe('Datafile details panel component', () => {
  let rowData: Datafile;
  const detailsPanelResize = vi.fn();

  const renderComponent = (): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DatafileDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );

  beforeEach(() => {
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    vi.mocked(useDatafileDetails).mockReturnValue({
      data: rowData,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls detailsPanelResize on load', () => {
    renderComponent();
    expect(detailsPanelResize).toHaveBeenCalled();
  });

  it('does not call detailsPanelResize if not provided', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DatafileDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).not.toHaveBeenCalled();
  });
});
