import React from 'react';
import { shallow } from 'enzyme';
import InvestigationDetailsPanel from './investigationDetailsPanel.component';
import { Investigation } from '../app.types';

describe('Investigation details panel component', () => {
  let rowData: Investigation;
  const detailsPanelResize = jest.fn();

  beforeEach(() => {
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
            name: 'study',
            modTime: '2019-06-10',
            createTime: '2019-06-11',
          },
        },
      ],
      startDate: '2019-06-10',
      endDate: '2019-06-11',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <InvestigationDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
