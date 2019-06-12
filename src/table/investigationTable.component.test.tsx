import React from 'react';
import { shallow as enzymeShallow } from 'enzyme';
import createShallow from '@material-ui/core/test-utils/createShallow';
import InvestigationTable from './investigationTable.component';

describe('InvestigationTable component', () => {
  let shallow: typeof enzymeShallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('should render correctly', () => {
    const wrapper = shallow(<InvestigationTable />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render details panel correctly', () => {
    const row = {
      title: 'Test',
      visitId: 1,
      rBNumber: '1',
      doi: 'doi',
      size: 1,
      instrument: 'Test instrument',
      startDate: new Date('2019-06-10'),
      endDate: new Date('2019-06-11'),
    };
    const wrapper = shallow(<InvestigationTable />);

    const detailPanel = wrapper.prop('detailPanel')(row);
    const detailPanelWrapper = shallow(detailPanel);

    expect(detailPanelWrapper).toMatchSnapshot();
  });
});
