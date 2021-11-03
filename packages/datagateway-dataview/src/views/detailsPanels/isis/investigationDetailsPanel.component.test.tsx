import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import InvestigationDetailsPanel from './investigationDetailsPanel.component';
import { Investigation, useInvestigationDetails } from 'datagateway-common';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationDetails: jest.fn(),
  };
});

describe('Investigation details panel component', () => {
  let mount;
  let rowData: Investigation;
  const detailsPanelResize = jest.fn();
  const viewDatasets = jest.fn();

  const createWrapper = (): ReactWrapper => {
    return mount(
      <QueryClientProvider client={new QueryClient()}>
        <InvestigationDetailsPanel
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
          },
        },
      ],
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    };

    (useInvestigationDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('InvestigationDetailsPanel').props()).toMatchSnapshot();
  });

  it('renders user, sample and publication tabs when present in the data', () => {
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

    const wrapper = createWrapper();
    expect(wrapper.find('InvestigationDetailsPanel').props()).toMatchSnapshot();
  });

  it('calls useInvestigationDetails hook on load', () => {
    createWrapper();
    expect(useInvestigationDetails).toHaveBeenCalledWith(rowData.id);
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.publications = [
      {
        id: 8,
        fullReference: 'Test publication',
      },
    ];

    const wrapper = createWrapper();

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper
      .find('#investigation-publications-tab')
      .hostNodes()
      .simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('detailsPanelResize not called when not provided', () => {
    rowData.publications = [
      {
        id: 8,
        fullReference: 'Test publication',
      },
    ];

    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <InvestigationDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper
      .find('#investigation-publications-tab')
      .hostNodes()
      .simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-test-id="investigation-details-panel-doi-link"]')
        .first()
        .text()
    ).toEqual('doi 1');
    expect(
      wrapper
        .find('[data-test-id="investigation-details-panel-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/doi 1');
  });

  it('gracefully handles StudyInvestigations without Studies and InvestigationUsers without Users', () => {
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

    (useInvestigationDetails as jest.Mock).mockReturnValueOnce({
      data: rowData,
    });

    const wrapper = createWrapper();
    expect(wrapper.find('InvestigationDetailsPanel').props()).toMatchSnapshot();
  });

  it('calls dataset view if view datasets tab clicked', () => {
    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <InvestigationDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatasets={viewDatasets}
        />
      </QueryClientProvider>
    );

    expect(viewDatasets).not.toHaveBeenCalled();
    wrapper.find('#investigation-datasets-tab').hostNodes().simulate('click');
    expect(viewDatasets).toHaveBeenCalled();
  });

  it('Shows "No <field> provided" incase of a null field', () => {
    const { summary, doi, startDate, endDate, ...amendedRowData } = rowData;

    (useInvestigationDetails as jest.Mock).mockReturnValueOnce({
      data: amendedRowData,
    });

    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <InvestigationDetailsPanel
          rowData={amendedRowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );

    expect(wrapper.html()).toContain(
      '<b>investigations.details.summary not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>investigations.details.doi not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>investigations.details.start_date not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>investigations.details.end_date not provided</b>'
    );
  });
});
