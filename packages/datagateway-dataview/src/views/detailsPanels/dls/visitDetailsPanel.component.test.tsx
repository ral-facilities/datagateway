import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import VisitDetailsPanel from './visitDetailsPanel.component';
import { Investigation } from 'datagateway-common';

describe('Visit details panel component', () => {
  let shallow;
  let mount;
  let rowData: Investigation;
  const detailsPanelResize = jest.fn();
  const fetchDetails = jest.fn();
  const fetchSize = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
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
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
    fetchDetails.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
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

    const wrapper = shallow(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders calculate size button when size has not been calculated', () => {
    const { size, ...rowDataWithoutSize } = rowData;

    const wrapper = shallow(
      <VisitDetailsPanel
        rowData={rowDataWithoutSize}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calculates size when button is clicked', () => {
    const { size, ...rowDataWithoutSize } = rowData;

    const wrapper = mount(
      <VisitDetailsPanel
        rowData={rowDataWithoutSize}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    wrapper.find('#visit-details-panel button').simulate('click');

    expect(fetchSize).toHaveBeenCalled();
    expect(fetchSize).toHaveBeenCalledWith(1);
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.publications = [
      {
        id: 8,
        fullReference: 'Test publication',
      },
    ];

    const wrapper = mount(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

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
      <VisitDetailsPanel
        rowData={rowData}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper.find('#visit-publications-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('calls fetchDetails on load if investigationUsers, samples or publications are missing', () => {
    mount(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails).toHaveBeenCalledWith(1);
    fetchDetails.mockClear();

    rowData.investigationUsers = [];
    mount(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails).toHaveBeenCalledWith(1);
    fetchDetails.mockClear();

    rowData.samples = [];
    mount(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails).toHaveBeenCalledWith(1);
    fetchDetails.mockClear();

    rowData.publications = [];
    mount(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(fetchDetails).not.toHaveBeenCalled();
  });

  it('gracefully handles InvestigationUsers without Users', () => {
    rowData.investigationUsers = [
      {
        id: 4,
        role: 'Investigator',
      },
    ];

    const wrapper = shallow(
      <VisitDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
