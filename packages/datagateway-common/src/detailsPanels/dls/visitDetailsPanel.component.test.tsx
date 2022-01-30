import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import VisitDetailsPanel from './visitDetailsPanel.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';
import {
  useInvestigationDetails,
  useInvestigationSize,
} from '../../api/investigations';

jest.mock('../../api/investigations');

describe('Visit details panel component', () => {
  let mount;
  let rowData: Investigation;
  const detailsPanelResize = jest.fn();

  const createWrapper = (): ReactWrapper => {
    return mount(
      <QueryClientProvider client={new QueryClient()}>
        <VisitDetailsPanel
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
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    };

    (useInvestigationDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
    (useInvestigationSize as jest.Mock).mockReturnValue({
      data: 1,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('VisitDetailsPanel').props()).toMatchSnapshot();
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
    expect(wrapper.find('VisitDetailsPanel').props()).toMatchSnapshot();
  });

  it('checks if multiple samples result in change of title to plural version', () => {
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

    const wrapper = createWrapper();
    expect(wrapper.find('VisitDetailsPanel').props()).toMatchSnapshot();
  });

  it('checks if multiple publications result in change of title to plural version', () => {
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

    const wrapper = createWrapper();
    expect(wrapper.find('VisitDetailsPanel').props()).toMatchSnapshot();
  });

  it('renders publications tab and text "No publications" when no data is present', () => {
    rowData.publications = [];
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="visit-details-panel-no-publications"]')
        .exists()
    ).toBeTruthy();
  });

  it('renders samples tab and text "No samples" when no data is present', () => {
    rowData.samples = [];
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="visit-details-panel-no-samples"]').exists()
    ).toBeTruthy();
  });

  it('renders users tab and text "No users" when no data is present', () => {
    rowData.investigationUsers = [];
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="visit-details-panel-no-name"]').exists()
    ).toBeTruthy();
  });

  it('calls useInvestigationDetails and useInvestigationSize hooks on load', () => {
    createWrapper();
    expect(useInvestigationDetails).toHaveBeenCalledWith(rowData.id);
    expect(useInvestigationSize).toHaveBeenCalledWith(rowData.id);
  });

  it('renders calculate size button when size has not been calculated', () => {
    (useInvestigationSize as jest.Mock).mockReturnValueOnce({});
    const wrapper = createWrapper();
    expect(wrapper.find('#calculate-size-btn').exists()).toBeTruthy();
  });

  it('calculates size when button is clicked', () => {
    const fetchSize = jest.fn();
    (useInvestigationSize as jest.Mock).mockReturnValueOnce({
      refetch: fetchSize,
    });

    const wrapper = createWrapper();
    wrapper.find('#calculate-size-btn').hostNodes().simulate('click');
    expect(fetchSize).toHaveBeenCalled();
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

    wrapper.find('#visit-publications-tab').hostNodes().simulate('click');

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
        <VisitDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper.find('#visit-publications-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('gracefully handles InvestigationUsers without Users', () => {
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
    expect(wrapper.find('VisitDetailsPanel').props()).toMatchSnapshot();
  });

  it('Shows "No <field> provided" incase of a null field', () => {
    const { summary, startDate, endDate, ...amendedRowData } = rowData;

    (useInvestigationDetails as jest.Mock).mockReturnValueOnce({
      data: amendedRowData,
    });

    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <VisitDetailsPanel
          rowData={amendedRowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );

    expect(wrapper.html()).toContain(
      '<b>investigations.details.start_date not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>investigations.details.end_date not provided</b>'
    );
    expect(wrapper.html()).toContain(
      '<b>investigations.details.summary not provided</b>'
    );
  });
});
