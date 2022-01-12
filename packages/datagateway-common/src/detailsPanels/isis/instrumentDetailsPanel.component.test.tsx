import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import InstrumentDetailsPanel from './instrumentDetailsPanel.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';
import { Instrument } from '../../app.types';
import { useInstrumentDetails } from '../../api/instruments';

jest.mock('../../api/instruments');

describe('Instrument details panel component', () => {
  let mount;
  let rowData: Instrument;
  const detailsPanelResize = jest.fn();

  const createWrapper = (): ReactWrapper => {
    return mount(
      <QueryClientProvider client={new QueryClient()}>
        <InstrumentDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    rowData = {
      id: 1,
      name: 'Test',
      fullName: 'Test Instrument',
      description: 'An instrument purely for testing',
      type: 'testing',
      url: 'www.example.com',
    };

    (useInstrumentDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('InstrumentDetailsPanel').props()).toMatchSnapshot();
  });

  it('renders users tab when present in the data', () => {
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

    const wrapper = createWrapper();
    expect(wrapper.find('InstrumentDetailsPanel').props()).toMatchSnapshot();
  });

  it('calls useInstrumentDetails hook on load', () => {
    createWrapper();
    expect(useInstrumentDetails).toHaveBeenCalledWith(rowData.id);
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
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

    const wrapper = createWrapper();

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper.find('#instrument-users-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('detailsPanelResize not called when not provided', () => {
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

    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <InstrumentDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper.find('#instrument-users-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('gracefully handles InstrumentScientists without Users', () => {
    rowData.instrumentScientists = [
      {
        id: 4,
      },
    ];

    (useInstrumentDetails as jest.Mock).mockReturnValueOnce({
      data: rowData,
    });

    const wrapper = createWrapper();
    expect(wrapper.find('InstrumentDetailsPanel').props()).toMatchSnapshot();
  });

  it('renders publication tab and text "No Scientists" when no data is prsent', () => {
    rowData.instrumentScientists = [];
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="instrument-details-panel-no-name"]').exists()
    ).toBeTruthy();
  });

  it('Shows "No <field> provided" incase of a null field', () => {
    const { description, type, url, ...amendedRowData } = rowData;

    (useInstrumentDetails as jest.Mock).mockReturnValueOnce({
      data: amendedRowData,
    });

    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <InstrumentDetailsPanel
          rowData={amendedRowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );

    expect(wrapper.html()).toContain(
      '<b>instruments.details.description not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>instruments.details.type not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>instruments.details.url not provided</b>'
    );
  });

  it('displays shortened instrument name if full name not provided', () => {
    rowData = {
      id: 1,
      name: 'My test instrument',
      description: 'An instrument purely for testing',
      type: 'testing',
      url: 'www.example.com',
    };

    (useInstrumentDetails as jest.Mock).mockReturnValueOnce({
      data: rowData,
    });

    const wrapper = createWrapper();
    expect(wrapper.html()).toContain('<b>My test instrument</b>');
  });
});
