import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import InstrumentsDetailsPanel from './instrumentDetailsPanel.component';
import { Instrument } from 'datagateway-common';

describe('Instrument details panel component', () => {
  let shallow;
  let mount;
  let rowData: Instrument;
  const detailsPanelResize = jest.fn();
  const fetchDetails = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    rowData = {
      id: 1,
      name: 'Test',
      fullName: 'Test Instrument',
      description: 'An instrument purely for testing',
      type: 'testing',
      url: 'www.example.com',
    };
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
    fetchDetails.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <InstrumentsDetailsPanel rowData={rowData} fetchDetails={fetchDetails} />
    );
    expect(wrapper).toMatchSnapshot();
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

    const wrapper = shallow(
      <InstrumentsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
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

    const wrapper = mount(
      <InstrumentsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

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
      <InstrumentsDetailsPanel rowData={rowData} fetchDetails={fetchDetails} />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper.find('#instrument-users-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('calls fetchDetails on load', () => {
    mount(
      <InstrumentsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(fetchDetails).toHaveBeenCalled();
    expect(fetchDetails).toHaveBeenCalledWith(1);
  });

  it('gracefully handles InstrumentScientists without Users', () => {
    rowData.instrumentScientists = [
      {
        id: 4,
      },
    ];

    const wrapper = shallow(
      <InstrumentsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
