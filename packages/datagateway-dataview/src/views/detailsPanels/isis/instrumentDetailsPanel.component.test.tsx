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
      ID: 1,
      NAME: 'Test',
      FULLNAME: 'Test Instrument',
      DESCRIPTION: 'An instrument purely for testing',
      TYPE: 'testing',
      URL: 'www.example.com',
    };
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
    fetchDetails.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <InstrumentsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders users tab when present in the data', () => {
    rowData.INSTRUMENTSCIENTIST = [
      {
        ID: 4,
        INSTRUMENT_ID: 1,
        USER_ID: 5,
        USER_: {
          ID: 5,
          NAME: 'Louise',
          FULLNAME: 'Louise Davies',
        },
      },
      {
        ID: 9,
        INSTRUMENT_ID: 1,
        USER_ID: 10,
        USER_: {
          ID: 10,
          NAME: 'Louise',
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
    rowData.INSTRUMENTSCIENTIST = [
      {
        ID: 4,
        INSTRUMENT_ID: 1,
        USER_ID: 5,
        USER_: {
          ID: 5,
          NAME: 'Louise',
          FULLNAME: 'Louise Davies',
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
    rowData.INSTRUMENTSCIENTIST = [
      {
        ID: 4,
        INSTRUMENT_ID: 1,
        USER_ID: 5,
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
