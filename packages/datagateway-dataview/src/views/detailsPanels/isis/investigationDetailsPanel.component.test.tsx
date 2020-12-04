import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import InvestigationsDetailsPanel from './investigationDetailsPanel.component';
import { Investigation } from 'datagateway-common';

describe('Investigation details panel component', () => {
  let shallow;
  let mount;
  let rowData: Investigation;
  const detailsPanelResize = jest.fn();
  const fetchDetails = jest.fn();
  const viewDatasets = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    rowData = {
      ID: 1,
      TITLE: 'Test 1',
      NAME: 'Test 1',
      SUMMARY: 'foo bar',
      VISIT_ID: '1',
      RB_NUMBER: '1',
      DOI: 'doi 1',
      SIZE: 1,
      INVESTIGATIONINSTRUMENT: [
        {
          ID: 1,
          INVESTIGATION_ID: 1,
          INSTRUMENT_ID: 3,
          INSTRUMENT: {
            ID: 3,
            NAME: 'LARMOR',
            FACILITY_ID: 1,
          },
        },
      ],
      STUDYINVESTIGATION: [
        {
          ID: 11,
          INVESTIGATION_ID: 1,
          STUDY_ID: 12,
          STUDY: {
            ID: 12,
            PID: 'study pid',
          },
        },
      ],
      STARTDATE: '2019-06-10',
      ENDDATE: '2019-06-11',
    };
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
    fetchDetails.mockClear();
    viewDatasets.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders user, sample and publication tabs when present in the data', () => {
    rowData.INVESTIGATIONUSER = [
      {
        ID: 4,
        INVESTIGATION_ID: 1,
        USER_ID: 5,
        ROLE: 'Investigator',
        USER_: {
          ID: 5,
          NAME: 'Louise',
          FULLNAME: 'Louise Davies',
        },
      },
      {
        ID: 9,
        INVESTIGATION_ID: 1,
        USER_ID: 10,
        ROLE: 'Investigator',
        USER_: {
          ID: 10,
          NAME: 'Louise',
        },
      },
    ];

    rowData.SAMPLE = [
      {
        ID: 7,
        INVESTIGATION_ID: 1,
        NAME: 'Test sample',
      },
    ];

    rowData.PUBLICATION = [
      {
        ID: 8,
        FULLREFERENCE: 'Test publication',
      },
    ];

    const wrapper = shallow(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.PUBLICATION = [
      {
        ID: 8,
        FULLREFERENCE: 'Test publication',
      },
    ];

    const wrapper = mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper
      .find('#investigation-publications-tab')
      .hostNodes()
      .simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('calls fetchDetails on load if INVESTIGATIONUSER, SAMPLE or PUBLICATIONS are missing', () => {
    mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );

    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails).toHaveBeenCalledWith(1);
    fetchDetails.mockClear();

    rowData.INVESTIGATIONUSER = [];
    mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );

    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails).toHaveBeenCalledWith(1);
    fetchDetails.mockClear();

    rowData.SAMPLE = [];
    mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );

    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails).toHaveBeenCalledWith(1);
    fetchDetails.mockClear();

    rowData.PUBLICATION = [];
    mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );
    expect(fetchDetails).not.toHaveBeenCalled();
  });

  it('gracefully handles StudyInvestigations without Studies and InvestigationUsers without Users', () => {
    rowData.STUDYINVESTIGATION = [
      {
        ID: 11,
        INVESTIGATION_ID: 1,
        STUDY_ID: 12,
      },
    ];

    rowData.INVESTIGATIONUSER = [
      {
        ID: 4,
        INVESTIGATION_ID: 1,
        USER_ID: 5,
        ROLE: 'Investigator',
      },
    ];

    const wrapper = shallow(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('push new address when clicking dataset tab', () => {
    const wrapper = mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        viewDatasets={viewDatasets}
      />
    );

    expect(viewDatasets).toHaveBeenCalledTimes(0);

    wrapper.find('#investigation-datasets-tab').hostNodes().simulate('click');

    expect(viewDatasets).toHaveBeenCalledTimes(1);
  });
});
