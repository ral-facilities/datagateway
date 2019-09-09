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
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
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
          FULL_NAME: 'Louise Davies',
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
        FULL_REFERENCE: 'Test publication',
      },
    ];

    const wrapper = shallow(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.PUBLICATION = [
      {
        ID: 8,
        FULL_REFERENCE: 'Test publication',
      },
    ];

    const wrapper = mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper
      .find('#investigation-publications-tab')
      .hostNodes()
      .simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('calls fetchDetails on load', () => {
    const wrapper = mount(
      <InvestigationsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(fetchDetails).toHaveBeenCalled();
    expect(fetchDetails).toHaveBeenCalledWith(1);
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
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
